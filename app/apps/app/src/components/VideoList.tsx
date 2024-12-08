import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { ref, getDownloadURL } from "firebase/storage";

import { selectUtils } from "@app/redux/selectors/utils";
import SortTypes from "@app/constants/SortTypes";
import { setSortType } from "@app/redux/slices/utilsSlice";
import { Video, VideoStatus } from "@shared/types/Video";
import { storage } from "@app/firebase/firebaseConfig";

import ToastTypes from "../constants/ToastTypes";

import useVideoNumFromWidth from "../hooks/useVideoNumFromWidth";
import useToast from "../hooks/useToast";

import { firebaseMethods } from "../utils/callFirebaseFunction";
import { callMicroservice } from "../utils/callFirebaseMicroservice";

import VideoIcon, { renderSkeletonItems } from "./VideoIcon";
import VideoListLoader from "./VideoListLoader";
import InfiniteLoader from "./InfiniteLoader";
import useFirestoreListener from "../hooks/useFirestoreListener";

interface CtaProps {
  position: number;
  element: JSX.Element;
}

interface VideoListProps {
  cta?: CtaProps;
  getNumberOfVideos?: (number) => void;
  authorId?: string;
  forUser?: boolean;
  showOptions?: boolean;
  showTag?: boolean;
  EmptyListView?: ({ cta }) => JSX.Element;
  defaultSortType?: SortTypes;
}

const VIDEOS_AMOUNT_BEFORE_RESPONSE = -1;

function getPageStep(defaultPageNum: number, cta?: CtaProps) {
  if (!cta) {
    return defaultPageNum;
  }

  return cta.position * 2;
}

function EmptyListDefaultView({ cta }) {
  return <>{cta ? cta.element : null}</>;
}

export default function VideoList({
  cta,
  getNumberOfVideos,
  authorId,
  forUser = false,
  showOptions = false,
  showTag = false,
  EmptyListView = EmptyListDefaultView,
  defaultSortType,
}: VideoListProps) {
  const { openToast } = useToast();
  const defaultPageStep = useVideoNumFromWidth();

  const [videosList, setVideosList] = useState<Video[]>([]);
  const [totalVideos, setTotalVideos] = useState<number>(VIDEOS_AMOUNT_BEFORE_RESPONSE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageNumber, setPageNumber] = useState<number>(getPageStep(defaultPageStep, cta));
  const [isInitialListLoaded, setIsInitialListLoaded] = useState<boolean>(false);

  const { upToDateData, setDocumentsIdsToListen, addDocumentIdToListen } = useFirestoreListener("videos");

  const { query } = useParams();

  const { filter } = useSelector(selectUtils);
  const dispatch = useDispatch();

  const generateVideoIcon = (video: Video): JSX.Element => (
    <VideoIcon
      key={video.id}
      video={video}
      showOptions={showOptions}
      showTag={showTag}
      onVideoDeleted={onVideoDeleted}
      onVideoRegenerated={onVideoRegenerated}
    />
  );

  const onVideoDeleted = (videoId: string): void => {
    setVideosList(videosList.filter(video => video.id !== videoId));
  };

  const onVideoRegenerated = (videoId: string): void => {
    setVideosList(currentVideoList => {
      // Set video status to PENDING for video id = videoId
      return currentVideoList.map(video => (video.id === videoId ? { ...video, status: VideoStatus.PENDING } : video));
    });
    addDocumentIdToListen(videoId);
  };

  const requestVideos = async ({ sortType, firstIndex }: { sortType?: SortTypes; firstIndex?: number } = {}) => {
    try {
      const response = await callMicroservice<{ videos: Video[]; total: number }>(firebaseMethods.GET_VIDEOS, {
        firstIndex: firstIndex ?? videosList.length,
        lastIndex: pageNumber,
        title: query,
        sortType: sortType ?? filter.sortType,
        ...(!forUser && { selectedGenre: filter.selectedGenre }),
        authorId,
        forUser,
      });

      // Check if there are any pending videos
      const pendingVideosIds = response.videos
        .filter(video => video.status === VideoStatus.PENDING)
        .map(pendingVideo => pendingVideo.id);

      // Listen to pending videos changes
      if (pendingVideosIds.length > 0) {
        setDocumentsIdsToListen(pendingVideosIds);
      }

      if (firstIndex === 0) {
        setVideosList(response.videos);
      } else {
        setVideosList([...videosList, ...response.videos]);
      }
      setTotalVideos(response.total);
    } catch (error) {
      openToast("Something went wrong, please try again.", ToastTypes.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const debounceRequestVideos = _.debounce(requestVideos, 300);

  const handleLoadMoreVideos = (): void => {
    setPageNumber(prevPageNumber => {
      return prevPageNumber + getPageStep(defaultPageStep, cta);
    });
  };

  const handleVideoUpodate = async (videos: Video[], upToDateData: { [key: string]: any }) => {
    const newVideoList = await Promise.all(
      videos.map(async video => {
        const updatedVideo = upToDateData[video.id];
        const isSameStatus = video.status === updatedVideo?.status;
        const isSameImages = _.isEqual(video.thumbnail_images_url, updatedVideo?.thumbnail_images_url);

        if (!updatedVideo || (isSameStatus && isSameImages)) {
          return video;
        }

        let images = video.thumbnail_images_url;

        if (!isSameImages) {
          images = await Promise.all(
            updatedVideo.thumbnail_images_url.map(image => getDownloadURL(ref(storage, image)))
          );
        }

        return {
          ...video,
          status: updatedVideo.status,
          url: updatedVideo.url,
          duration: updatedVideo.duration,
          thumbnail_images_url: images,
        };
      })
    );

    setVideosList(newVideoList);
  };

  useEffect(() => {
    if (defaultSortType) {
      dispatch(setSortType(defaultSortType));
    }

    void requestVideos({ sortType: defaultSortType }).then(() => {
      setIsInitialListLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isInitialListLoaded) {
      return;
    }
    setIsLoading(true);
    setVideosList([]);
    setPageNumber(getPageStep(defaultPageStep, cta));
    // Reset the total videos to the default value
    void requestVideos({ firstIndex: 0 });
  }, [filter.selectedGenre, filter.sortType, query]);

  useEffect(() => {
    if (!isInitialListLoaded) {
      return;
    }

    void debounceRequestVideos();
  }, [cta, pageNumber]);

  useEffect(() => {
    if (getNumberOfVideos) {
      getNumberOfVideos(totalVideos);
    }
  }, [totalVideos]);

  useEffect(() => {
    // When a video status changes, update the video status in the list
    void handleVideoUpodate(videosList, upToDateData);
  }, [upToDateData]);

  if (isLoading && videosList.length === 0) {
    return (
      <>
        <VideoListLoader repeatCount={cta?.position ?? pageNumber} />
        {cta ? cta.element : null}
      </>
    );
  }

  if (videosList.length === 0) {
    return <EmptyListView cta={cta} />;
  }

  return (
    <>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5"
      >
        <InfiniteLoader
          items={videosList.slice(0, cta?.position ?? videosList.length)}
          stopLoading={!!cta || totalVideos <= videosList.length}
          totalItems={totalVideos}
          currentItems={videosList.length}
          defaultQuantity={defaultPageStep}
          renderSkeletonMethod={renderSkeletonItems}
          renderItem={generateVideoIcon}
          onLoadMorePosts={handleLoadMoreVideos}
        />
      </ul>

      {cta && (
        <>
          {cta.element}

          {totalVideos >= cta.position && (
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5"
            >
              <InfiniteLoader
                items={videosList.slice(cta.position)}
                stopLoading={totalVideos <= videosList.length}
                totalItems={totalVideos}
                currentItems={videosList.length}
                defaultQuantity={defaultPageStep}
                renderSkeletonMethod={renderSkeletonItems}
                renderItem={generateVideoIcon}
                onLoadMorePosts={handleLoadMoreVideos}
              />
            </ul>
          )}
        </>
      )}
    </>
  );
}
