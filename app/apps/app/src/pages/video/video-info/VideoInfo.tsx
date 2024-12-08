import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { classNames } from "@frontend/utils/classNames";
import { RateIcons } from "./components/RateIcons";
import { Tags } from "@frontend/Tags";
import { VideoOptions } from "./components/VideoOptions";
import { Avatar } from "@app/components/Avatar";
import { Tooltip } from "@material-tailwind/react";
import { timeSince } from "@frontend/timeConverter";
import { genreList } from "@frontend/listData";
import { Video } from "@shared/types/Video";
import VideoInfoSkeleton from "./components/VideoInfoSkeleton";

interface CommentsProps {
  video: Video | null;
}

export function VideoInfo({ video }: CommentsProps) {
  const { id } = useParams<{ id: string }>();

  const [textClamped, setTextClamped] = useState<boolean>(true);

  if (!video || !id) {
    return <VideoInfoSkeleton />;
  }

  return (
    <div className="px-4 pb-8">
      <h1 className="text-2xl font-semibold text-gray-900 mt-5 mb-3">{video.title}</h1>
      <div className="flex flex-row gap-4 justify-between">
        <div className="group block flex-shrink-0">
          {video.author_name == null ? (
            <div className="flex items-center">
              <Avatar uid="" avatarUrl="" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Deleted User</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <Link to={`/channel/${video.author}`}>
                <Avatar uid={video.author} avatarUrl={video.avatar_url} />
              </Link>
              <div className="ml-3">
                <Tooltip placement="top" content={`${video.author_name} channel`}>
                  <Link to={`/channel/${video.author}`}>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{video.author_name}</p>
                    <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">View Collection</p>
                  </Link>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center">
          <RateIcons
            videoId={id}
            likes={video.likes}
            dislikes={video.dislikes}
            userInteraction={video.userInteraction}
          />
          <VideoOptions videoId={video.id} />
        </div>
      </div>
      <div className="mx-auto w-full mb-6 p-2 sm:p-4 lg:p-6 bg-slate-100 rounded mt-4 py-3 shadow-md">
        <Tags tags={video.tags} genre={genreList[video.genre]} />
        <div
          className={classNames(
            "mb-3 text-gray-600 text-sm font-medium cursor-pointer lg:cursor-default",
            textClamped ? "line-clamp-2 sm:line-clamp-2 md:line-clamp-3 lg:line-clamp-none " : "line-clamp-none"
          )}
          onClick={() => setTextClamped(currentValue => !currentValue)}
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
    </div>
  );
}
