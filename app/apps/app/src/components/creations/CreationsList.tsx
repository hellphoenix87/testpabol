import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { timeSince } from "@frontend/timeConverter";
import Creation from "@app/interfaces/Creation";
import { VideoCameraIcon } from "@heroicons/react/20/solid";
import useToast from "@app/hooks/useToast";
import useVideoNumFromWidth from "@app/hooks/useVideoNumFromWidth";
import ToastTypes from "@app/constants/ToastTypes";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import Breakpoints from "@app/constants/Breakpoints";
import VideoListLoader from "@app/components/VideoListLoader";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { selectUser } from "@app/redux/selectors/user";
import ImageCard from "@app/components/image-card/ImageCard";
import NewCreationIcon from "./NewCreationIcon";
import CreationIconOptions from "./CreationIconOptions";

export default function CreationsList() {
  const { openToast } = useToast();
  const user = useSelector(selectUser);

  const defaultPageStep = useVideoNumFromWidth({
    breakpoints: [
      { width: Breakpoints.SM, videoNum: 1 },
      { width: Breakpoints.MD, videoNum: 1 },
      { width: Breakpoints.LG, videoNum: 1 },
      { width: Breakpoints.XL, videoNum: 2 },
      { width: Breakpoints.XXL, videoNum: 3 },
    ],
    defaultVideoNum: 4,
  });

  const [creationsList, setCreationsList] = useState<Creation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const onCreationDeleted = (cid: string) => {
    setCreationsList(currentCreationsList => currentCreationsList.filter(creation => creation.id !== cid));
  };

  const requestCreations = async () => {
    setIsLoading(true);
    try {
      const response = await callMicroservice<{ creations: Creation[] }>(firebaseMethods.GET_CREATIONS, {});
      setCreationsList(response.creations);
    } catch (error) {
      openToast("Something went wrong, please try again.", ToastTypes.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void requestCreations();
  }, []);

  if (isLoading && creationsList.length === 0) {
    return (
      <VideoListLoader repeatCount={defaultPageStep}>
        <NewCreationIcon />
      </VideoListLoader>
    );
  }

  return (
    <>
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-4 gap-y-8 mb-12 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5"
      >
        <NewCreationIcon />
        {creationsList.map(creation => (
          <ImageCard
            key={creation.id}
            images={creation?.thumbnail_images_url}
            imageLink={`/create/${creation.id}`}
            templateText="Unfinished Creation"
            TagImage={VideoCameraIcon}
            tagText="Creation"
            authorName={user?.display_name}
            authorUid={user?.uid}
            authorAvatar={user?.avatar_url}
            imageName={creation?.title || "Unnamed project"}
            ImageStats={
              <p className="pointer-events-none inline-block text-xs font-small text-gray-500 -translate-y-1">
                Created {timeSince(creation.created_at._seconds)}
              </p>
            }
            ImageOptions={<CreationIconOptions cid={creation?.id} onCreationDeleted={onCreationDeleted} />}
          />
        ))}
      </ul>
    </>
  );
}
