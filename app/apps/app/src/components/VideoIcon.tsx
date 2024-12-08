import {
  ArrowPathRoundedSquareIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

import VideosStates from "@app/constants/VideosStates";
import { Video, VideoStatus } from "@shared/types/Video";

import VideoIconOptions from "./VideoIconOptions";
import VideoIconSkeleton from "./VideoIconSkeleton";
import ImageCard from "./image-card/ImageCard";
import { VideoAnnotation } from "./VideoAnnotation";

export function renderSkeletonItems(repeatCount: number) {
  if (repeatCount <= 0) {
    return [null];
  }

  return Array.from({ length: repeatCount }, (_, index) => (
    <li key={index} className="mb-2">
      <VideoIconSkeleton isVisible />
    </li>
  ));
}

interface VideoIconProps {
  video: Video;
  showOptions?: boolean;
  showTag?: boolean;
  onVideoDeleted?: (videoId: string) => void;
  onVideoRegenerated?: (videoId: string) => void;
}

export default function VideoIcon({
  video,
  showOptions = false,
  showTag = false,
  onVideoDeleted,
  onVideoRegenerated,
}: VideoIconProps) {
  const isVideoReady = video.status === VideoStatus.READY;

  const getTagImageAndText = (): { TagImage: React.ElementType | null; tagText: string | null } => {
    if (!showTag) {
      return {
        TagImage: null,
        tagText: null,
      };
    }

    if (video.status === VideoStatus.FAILED) {
      return {
        TagImage: ExclamationCircleIcon,
        tagText: VideosStates.FAILED,
      };
    }

    if (!isVideoReady) {
      return {
        TagImage: ArrowPathRoundedSquareIcon,
        tagText: VideosStates.CALCULATING,
      };
    }

    if (!video.checked_by_moderation) {
      return {
        TagImage: PencilSquareIcon,
        tagText: VideosStates.WAITING_FOR_REVIEW,
      };
    }

    if (video.accepted) {
      return {
        TagImage: CheckCircleIcon,
        tagText: VideosStates.PUBLISHED,
      };
    }

    return {
      TagImage: XCircleIcon,
      tagText: VideosStates.REGECTED_BY_MODERATION,
    };
  };

  const { TagImage, tagText } = getTagImageAndText();

  return (
    <ImageCard
      images={video.thumbnail_images_url}
      imageLink={isVideoReady ? `/video/${video.id}` : "#"}
      imageLinkClassName={!isVideoReady ? "cursor-default" : ""}
      templateText="Preview image is being generated"
      duration={isVideoReady ? video.duration : null}
      TagImage={TagImage}
      tagText={tagText}
      authorName={video.author_name}
      authorUid={video.author}
      authorAvatar={video.avatar_url}
      imageName={video.title}
      ImageStats={<VideoAnnotation video={video} />}
      ImageOptions={
        showOptions && (
          <VideoIconOptions video={video} onVideoDeleted={onVideoDeleted} onVideoRegenerated={onVideoRegenerated} />
        )
      }
    />
  );
}
