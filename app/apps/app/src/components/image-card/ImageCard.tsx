import { ReactNode, ElementType, useState } from "react";
import { FilmIcon } from "@heroicons/react/20/solid";
import { Link } from "react-router-dom";
import { Tooltip } from "@material-tailwind/react";

import { convertDuration } from "@frontend/timeConverter";
import { classNames } from "@frontend/utils/classNames";

import { Avatar } from "../Avatar";
import VideoIconSkeleton from "../VideoIconSkeleton";
import { ImageTag } from "./ImageTag";
import { Image } from "./Image";

interface ImageCardProps {
  images?: string[];
  imageLink: string;
  imageLinkClassName?: string;
  templateText: string;
  duration?: number | null;
  TagImage?: ElementType | null;
  tagText?: string | null;
  authorName?: string | null;
  authorUid?: string;
  authorAvatar?: string;
  imageNameClassName?: string;
  imageName: string;
  ImageStats?: ReactNode;
  ImageOptions?: ReactNode;
}

export default function ImageCard({
  images = [],
  imageLink,
  imageLinkClassName,
  templateText,
  duration,
  TagImage,
  tagText,
  authorName,
  authorUid,
  authorAvatar,
  imageNameClassName,
  imageName,
  ImageStats,
  ImageOptions,
}: ImageCardProps) {
  const [currentImage, setCurrentImage] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(!!images.length);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  const mouseEnterImage = (): void => {
    if (images.length <= 1) {
      return;
    }

    setCurrentImage(1);
    const id = setInterval(() => {
      setCurrentImage(currentImage => (currentImage + 1) % images.length);
    }, 1200);
    setIntervalId(id);
  };

  const mouseLeaveImage = (): void => {
    if (images.length <= 1) {
      return;
    }

    clearInterval(intervalId);
    setCurrentImage(0);
  };

  return (
    <li onMouseEnter={mouseEnterImage} onMouseLeave={mouseLeaveImage}>
      <div className="relative">
        <VideoIconSkeleton isVisible={isImageLoading} isMask />

        <div
          className={classNames(
            "transition-opacity easy-in-out duration-300",
            isImageLoading ? "opacity-0" : "opacity-100"
          )}
        >
          <Link to={imageLink} className={classNames("relative", imageLinkClassName)}>
            <div className="aspect-w-12 aspect-h-7 overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
              {images.map((image, i) => (
                <Image key={image} src={image} isVisible={currentImage === i} onLoadingUpdate={setIsImageLoading} />
              ))}

              {images.length === 0 && (
                <div className="group rounded-lg overflow-hidden border-2 border-dashed border-slate-300">
                  <div className="aspect-w-12 aspect-h-7 bg-gradient-to-b from-slate-300 to-slate-50 group-hover:from-slate-400 group-hover:to-slate-100 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <div className="inline-flex flex-col justify-center items-center gap-1 rounded-md bg-opacity-70">
                      <FilmIcon className="w-10 h-10 text-slate-400 group-hover:text-slate-500" />

                      {templateText && (
                        <div className="font-bold bg-gradient-to-t from-slate-400 to-slate-600 bg-clip-text text-transparent group-hover:from-slate-500 group-hover:to-slate-700">
                          {templateText}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {typeof duration === "number" && (
                <div className="flex items-end justify-end pointer-events-none -top-1 -left-1">
                  <span className="inline-block bg-black bg-opacity-50 rounded px-1 py-0.5 text-xs text-white">
                    {convertDuration(duration)}
                  </span>
                </div>
              )}
            </div>

            <ImageTag Image={TagImage} text={tagText} />
          </Link>

          <div className="flex flex-row justify-between">
            <div className="flex flex-row">
              {!authorName || !authorUid ? (
                <Avatar className="max-w-fit mt-2 mr-2" uid="" avatarUrl="" />
              ) : (
                <Tooltip content={authorName}>
                  <Link to={`/channel/${authorUid}`} className="inline-block">
                    <Avatar className="max-w-fit mt-2 mr-2" uid={authorUid} avatarUrl={authorAvatar} />
                  </Link>
                </Tooltip>
              )}

              <div className="overflow-hidden">
                <Link to={imageLink} className={classNames("flex-1", imageNameClassName)}>
                  <p className="pointer-events-none mt-2 block line-clamp-2 text-sm font-medium text-gray-900">
                    {imageName}
                  </p>
                </Link>

                {ImageStats}
              </div>
            </div>

            {ImageOptions}
          </div>
        </div>
      </div>
    </li>
  );
}
