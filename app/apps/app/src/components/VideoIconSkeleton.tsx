import { classNames } from "@frontend/utils/classNames";

interface VideoIconSkeletonProps {
  isVisible: boolean;
  isMask?: boolean;
}

export default function VideoIconSkeleton(props: VideoIconSkeletonProps) {
  const { isVisible, isMask } = props;

  if (!isVisible) {
    return null;
  }

  return (
    <div className={classNames("animate-pulse t-0 l-0 w-full h-full", isMask && "absolute")}>
      <div className="bg-gray-200 aspect-w-12 aspect-h-7 rounded-lg"></div>

      <div className="flex">
        <div className="bg-gray-200 inline-block w-9 h-9 rounded-full mt-2 mr-2"></div>

        <div className="flex-1">
          <div className="bg-gray-200 pointer-events-none mt-2 block truncate"></div>

          <div className="pt-1">
            <div className="bg-gray-200 w-full h-3 mb-2"></div>

            <div className="bg-gray-200 w-full h-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
