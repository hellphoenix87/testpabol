import { useEffect, useRef, useState } from "react";
import { classNames } from "@frontend/utils/classNames";
import VideoSkeleton, { NotAllowedTypeEnum } from "./components/VideoSkeleton";
import fluidPlayer from "fluid-player";
import { callMicroservice, generateStreamURL } from "@app/utils/callFirebaseMicroservice";
import HLS from "hls.js";
import "fluid-player/src/css/fluidplayer.css";
import { useParams } from "react-router-dom";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { useSelector } from "react-redux";
import { selectUser } from "@app/redux/selectors/user";
import User from "@app/interfaces/User";

export enum VideoType {
  hls = "application/x-mpegURL",
  mp4 = "video/mp4",
}

interface Video {
  url?: string;
  isAgeRestricted?: boolean;
}

export interface VideoPlayerParams {
  video: Video | null;
}

const MIN_WATCH_TIME = 10;

const getVideoType = (videoUrl?: string): VideoType | null => {
  if (!videoUrl) {
    return null;
  }

  if (videoUrl.includes(".mp4")) {
    return VideoType.mp4;
  }

  return VideoType.hls;
};

const getIsAllowedType = (video: Video | null, user: User) => {
  if (video && video.url && video.isAgeRestricted && !user.loggedIn) {
    return NotAllowedTypeEnum.AGE_RESTRICTION;
  }

  return NotAllowedTypeEnum.NONE;
};

export default function VideoPlayer({ video }: VideoPlayerParams) {
  const { id } = useParams();

  const user = useSelector(selectUser);

  const [videoLoading, setVideoLoading] = useState<boolean>(true);
  const [videoUrl, setVideoURL] = useState<string>("");
  const [player, setPlayer] = useState<FluidPlayerInstance>();

  const videoRef = useRef<HTMLVideoElement>(null);

  const type = getVideoType(video?.url);
  const notAllowedToPlayType = getIsAllowedType(video, user);

  const getVideoUrl = async (url: string) => {
    if (!id) {
      return;
    }

    // MP4 Video:
    if (type === VideoType.mp4) {
      setVideoURL(url);
      return;
    }

    // HLS Video:
    // generate signed urls for the media bucket or
    // generate hls init download url for the public bucket
    if (url?.startsWith("https://")) {
      setVideoURL(url);
      return;
    }

    const videoUrl = await generateStreamURL(id);
    setVideoURL(videoUrl);
  };

  const videoLoaded = () => {
    if (!videoRef?.current) {
      return;
    }

    let viewed = false;

    const handleTimeUpdate = async () => {
      if (!videoRef.current || videoRef.current.currentTime < MIN_WATCH_TIME || viewed) {
        return;
      }

      viewed = true;

      await callMicroservice(firebaseMethods.UPDATE_VIDEO_VIEWS, { id });

      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };

    videoRef.current.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
    };
  };

  useEffect(() => {
    if (video?.url && notAllowedToPlayType === NotAllowedTypeEnum.NONE) {
      void getVideoUrl(video?.url);
    }
  }, [video?.url]);

  useEffect(() => {
    if (!videoUrl || !videoRef.current) {
      return;
    }

    if (
      type === VideoType.hls &&
      videoRef.current?.canPlayType("application/x-mpegurl") &&
      navigator.userAgent.match(/Android/i)
    ) {
      const hls = new HLS();
      hls.loadSource(videoUrl);
      return hls.attachMedia(videoRef.current);
    }

    setPlayer(
      fluidPlayer(videoRef.current, {
        layoutControls: {
          allowTheatre: false,
          fillToContainer: true,
          keyboardControl: true,
          autoPlay: true,
        },
      })
    );
    setVideoLoading(false);

    const removeListener = videoLoaded();

    return () => {
      removeListener?.();
      player?.destroy();
    };
  }, [videoUrl]);

  return (
    <div className="relative black-video-bg">
      {videoLoading && <VideoSkeleton notAllowedType={notAllowedToPlayType} />}

      <div className="max-w-[110vh] m-auto w-full">
        <video
          id="hls-video-player"
          ref={videoRef}
          className={classNames("mx-auto relative w-full", videoLoading && "hidden")}
          autoPlay
          playsInline
          disablePictureInPicture
          controls
          data-testid="hls-video-player"
        >
          {type && videoUrl && <source src={videoUrl} type={type} />}
        </video>
      </div>
    </div>
  );
}
