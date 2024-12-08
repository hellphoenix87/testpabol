import { useEffect, useRef, useState } from "react";
import PageContainer from "./PageContainer";
import LoadingSpinner from "@backoffice/components/LoadingSpinner";
import { useParams, useNavigate } from "react-router-dom";
import { classNames } from "@frontend/utils/classNames";
import { Tags } from "@frontend/Tags";
import { genreList } from "@frontend/listData";
import { ModerationSettings } from "@backoffice/components/ModerationSettings";
import VideoReportsList from "@backoffice/components/reports/VideoReportsList";
import {
  callBackofficeMicroservice,
  backofficeFirebaseMethods,
  generateStreamURL,
} from "@backoffice/utils/callFirebaseMicroservice";
import { timeSince } from "@frontend/timeConverter";
import { SecondaryButton, AbortButton } from "@frontend/buttons";
import { NoSymbolIcon, CheckIcon } from "@heroicons/react/20/solid";
import fluidPlayer from "fluid-player";
import VideoInterface from "@backoffice/interfaces/video";

import "fluid-player/src/css/fluidplayer.css";

export default function Video() {
  const [video, setVideo] = useState<VideoInterface | null>(null);
  const [textClamped, setTextClamped] = useState(true);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement>(null);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch video data
    callBackofficeMicroservice(backofficeFirebaseMethods.GET_VIDEO_BY_ID, {
      id,
    })
      .then(result => {
        if (!result.data) {
          // Navigate to page not found if the video is not found
          navigate("/*");
          return;
        }
        setVideo(result.data);
      })
      .catch(() => navigate("/*"));
  }, []);

  const toggleAgeRestrictionFlag = async () => {
    if (!video) {
      return;
    }
    setLoading(true);
    const { data } = await callBackofficeMicroservice(backofficeFirebaseMethods.TOGGLE_AGE_RESTRICTION_FLAG, {
      videoId: id,
      isAgeRestricted: !video.isAgeRestricted,
    });
    setVideo({ ...video, isAgeRestricted: data.isAgeRestricted });
    setLoading(false);
  };

  const deleteVideo = async () => {
    if (!video) {
      return;
    }

    const userConfirmation = confirm(
      "Are you sure you want to delete this video? Users will not be able to see it anymore."
    );

    if (!userConfirmation) {
      return;
    }
    // Call the delete video function
    await callBackofficeMicroservice(backofficeFirebaseMethods.DELETE_VIDEO, {
      id,
    });

    alert("Video deleted successfully");

    navigate("/moderation");
  };

  const getSignedUrl = async (url: string, id: string) => {
    if (url?.includes(".mp4")) {
      return setVideoUrl(url);
    }
    setVideoUrl(videoUrl.startsWith("videos/") ? url : await generateStreamURL(id, video?.author));
  };

  useEffect(() => {
    if (video?.url && id) {
      void getSignedUrl(video.url, id);
    }
  }, [video?.url]);

  useEffect(() => {
    if (videoUrl && videoRef) {
      fluidPlayer(videoRef.current!, {
        layoutControls: {
          allowTheatre: false,
          fillToContainer: true,
          keyboardControl: true,
          autoPlay: true,
        },
      });
    }
  }, [videoUrl]);

  return (
    <PageContainer className="p-4">
      {video && !loading ? (
        <>
          <div className="w-full h-full">
            {video ? (
              <video ref={videoRef} width="100%" height="100%" controls autoPlay>
                <source src={videoUrl} type={video.url?.includes(".mp4") ? "video/mp4" : "application/x-mpegURL"} />
              </video>
            ) : (
              <LoadingSpinner />
            )}
          </div>
          <div className="flex flex-row justify-start items-center gap-4 mt-3">
            <h1 className="text-2xl font-semibold text-gray-900 ">{video.title}</h1>
            {!video.deleted && (
              <>
                <a
                  type="button"
                  className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  href={`https://pabolo.ai/video/${id}`}
                >
                  Visit public video
                </a>
                <AbortButton onClick={deleteVideo}>Delete video</AbortButton>
              </>
            )}
          </div>

          {!video.deleted && (
            <>
              {video?.isAgeRestricted ? (
                <div className="relative mt-3">
                  <dt className="inline text-gray-900 mr-2 font-bold">
                    <NoSymbolIcon className="h-5 w-5 mr-2 inline text-red-500" />
                    Age restriction
                  </dt>
                  <SecondaryButton onClick={toggleAgeRestrictionFlag}> Set As Safe Content </SecondaryButton>
                </div>
              ) : (
                <div className="relative mt-3">
                  <dt className="inline text-gray-900 mr-2 font-bold">
                    <CheckIcon className="h-5 w-5 mr-2 inline text-green-500" />
                    Safe Content
                  </dt>
                  <AbortButton onClick={toggleAgeRestrictionFlag}> Set As Adult Content </AbortButton>
                </div>
              )}
            </>
          )}

          <div className="flex flex-row gap-4 justify-between">
            <a href="#" className="group block flex-shrink-0 mt-3">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{video.author_name}</p>
                </div>
              </div>
            </a>
          </div>
          <div className="mx-auto w-full px-2 sm:px-4 lg:px-6 bg-slate-100 rounded mt-4 py-3 shadow-md">
            <Tags tags={video.tags} genre={genreList[video.genre]} />
            <div
              className={classNames(
                "mb-3 text-gray-600 text-sm font-medium",
                textClamped ? "line-clamp-2 sm:line-clamp-2 md:line-clamp-3 lg:line-clamp-none" : "line-clamp-none"
              )}
            >
              {video.description}
            </div>
            <button
              className="text-gray-600 text-sm font-bold hover:text-gray-900 lg:hidden"
              onClick={() => setTextClamped(currentValue => !currentValue)}
            >
              Show {textClamped ? "more" : "less"}
            </button>
            <p className="text-xs text-gray-500 text-right">
              <b>{video.views}</b> Views - created <b>{timeSince(video.created_at._seconds)}</b>
            </p>
          </div>

          {video.deleted ? (
            <h1 className="text-7xl text-center font-semibold text-red-800 mt-3">This video is deleted</h1>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mt-3">Reports on this video</h1>
                <VideoReportsList videoId={id} />
              </div>
              <div>
                <>
                  {video.accepted === true ? (
                    <h1 className="text-center text-2xl m-2">This video has been accepted by moderation</h1>
                  ) : (
                    video.accepted === false && (
                      <div className="text-center">
                        <h2 className="text-2xl m-2">This video has been refused by moderation</h2>
                        <p>Reason: {video?.refuse_reason?.selected_reason}</p>
                        <p>Additional text: {video?.refuse_reason?.text || "None"}</p>
                      </div>
                    )
                  )}
                </>

                <ModerationSettings video={video} videoId={id} refuseOnly={video.accepted} />
              </div>
            </>
          )}
        </>
      ) : (
        <LoadingSpinner />
      )}
    </PageContainer>
  );
}
