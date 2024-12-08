import { ReactElement, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Table } from "./Table";
import SelectMenu from "./selectMenu";
import { Tag } from "./Tag";
import LoadingSpinner from "./LoadingSpinner";
import LinkButton from "./LinkButton";
import {
  callBackofficeMicroservice,
  backofficeFirebaseMethods,
  callKitchenMicroservice,
  kitchenFirebaseMethods,
} from "@backoffice/utils/callFirebaseMicroservice";
import { convertDuration, timeSince } from "@frontend/timeConverter";
import { PrimaryButton, WarningButton } from "@frontend/buttons";
import { Video, VideoStatus } from "@shared/types/Video";

const VideoFilters = {
  ALL: "all",
  WAITING_FOR_REVIEW: "waitingForReview",
  PUBLISHED: "published",
  FAILED: "failed",
  REJECTED: "rejected",
  DELETED: "deleted",
};

const MODERATION_STATUS_OPTIONS_LIST = {
  [VideoFilters.WAITING_FOR_REVIEW]: "Videos for review",
  [VideoFilters.ALL]: "All Videos",
  [VideoFilters.PUBLISHED]: "Published Videos",
  [VideoFilters.REJECTED]: "Rejected Videos",
  [VideoFilters.FAILED]: "Failed Videos",
  [VideoFilters.DELETED]: "Deleted Videos",
};

const SORT_TYPES_OPTIONS_LIST = {
  NEWEST: "Newest",
  MOST_VIEWS: "Most views",
  BEST_RATINGS: "Best ratings",
};

const getStatusTag = (video: Video): ReactElement | null => {
  if (video.deleted) {
    return <Tag className="text-white bg-red-900" text="Deleted" />;
  }
  if (video.status === VideoStatus.PENDING) {
    return <Tag className="text-white bg-gray-600" text="Calculating" />;
  }
  if (video.status === VideoStatus.FAILED) {
    return <Tag className="text-white bg-red-500" text="Failed to be generated" />;
  }
  if (!video.checked_by_moderation) {
    return <Tag className="text-white bg-blue-700" text="Waiting for review" />;
  }
  if (video.checked_by_moderation && video.accepted) {
    return <Tag className="text-white bg-green-700" text="Accepted" />;
  }
  if (video.checked_by_moderation && !video.accepted) {
    return <Tag className="text-white bg-red-500" text="Rejected" />;
  }
  return null;
};

export default function VideoList() {
  const [bodyList, setBodyList] = useState([]);
  const [selectedList, setSelectedList] = useState<string>(VideoFilters.WAITING_FOR_REVIEW);
  const [selectedSort, setSelectedSort] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void fetchVideos();
  }, [selectedList, selectedSort]);

  const getReviewButton = (video: Video): ReactElement | null => {
    if (video.status === VideoStatus.PENDING) {
      return null;
    }

    if (video.status === VideoStatus.FAILED) {
      return <WarningButton onClick={() => regenerateVideo(video.id)}>Regenerate</WarningButton>;
    }

    return <LinkButton to={`/video/${video.id}`} name={video.checked_by_moderation ? "View" : "Review"} />;
  };

  const fetchVideos = async () => {
    setLoading(true);

    try {
      const result = await callBackofficeMicroservice(backofficeFirebaseMethods.GET_VIDEOS, {
        videosFilter: selectedList,
        sortType: selectedSort,
      });
      const bodyList = result.data.map(video => ({
        name: video.title,
        date: `Created ${timeSince(video?.created_at?._seconds)}`,
        duration: convertDuration(video?.duration),
        author: <Link to={`/user/${video.author}`}>{video.author_name}</Link>,
        status: getStatusTag(video),
        visit: getReviewButton(video),
      }));

      setBodyList(bodyList);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const regenerateVideo = videoId => {
    const userConfirmation = window.confirm(
      "Are you sure you want to regenerate this video? It may take few minutes, relaod the page after few minutes to check the status of the video."
    );

    if (userConfirmation) {
      void callKitchenMicroservice(kitchenFirebaseMethods.COOK_VIDEO, { creationId: videoId, regenerate: true });
      setTimeout(fetchVideos, 500);
    }
  };

  return (
    <>
      <div className="flex flex-row justify-start items-center space-x-4 m-6">
        <PrimaryButton onClick={fetchVideos} className="h-10">
          Reload Videos
        </PrimaryButton>

        <SelectMenu
          label="Filter by moderation status"
          value={selectedList}
          valuesList={Object.keys(MODERATION_STATUS_OPTIONS_LIST)}
          displayedOptionsLsit={Object.values(MODERATION_STATUS_OPTIONS_LIST)}
          onChange={e => setSelectedList(e.target.value)}
        />

        <SelectMenu
          label="Sort list"
          value={selectedSort}
          valuesList={Object.keys(SORT_TYPES_OPTIONS_LIST)}
          displayedOptionsLsit={Object.values(SORT_TYPES_OPTIONS_LIST)}
          onChange={e => setSelectedSort(e.target.value)}
        />
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : bodyList.length === 0 ? (
        <h1>No video found</h1>
      ) : (
        <Table headList={["name", "date", "duration", "author", "status", "visit"]} bodyList={bodyList} />
      )}
    </>
  );
}
