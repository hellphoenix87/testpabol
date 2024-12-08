import { timeSince } from "@frontend/timeConverter";

import { Video, VideoStatus } from "@shared/types/Video";

import { Tooltip } from "@material-tailwind/react";
import { Link } from "react-router-dom";

export function VideoAnnotation({ video }: { video: Video }) {
  return (
    <div className="flex flex-wrap items-center jutify-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500">
      {!video?.author_name ? (
        <span className="hover:text-gray-800 cursor-default">Deleted User</span>
      ) : (
        <Tooltip placement="top" content={`${video.author_name} channel`}>
          <Link to={`/channel/${video.author}`}>
            <span className="hover:text-gray-800 cursor-pointer">{video.author_name}</span>
          </Link>
        </Tooltip>
      )}

      <span className="pointer-events-none">
        {video.status === VideoStatus.READY
          ? `${video.views} Views - ${timeSince(video.created_at._seconds)}`
          : `Created ${timeSince(video.created_at._seconds)}`}
      </span>
    </div>
  );
}
