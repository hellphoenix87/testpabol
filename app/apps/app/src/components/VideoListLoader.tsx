import { renderSkeletonItems } from "./VideoIcon";

interface VideoListLoaderProps {
  repeatCount: number;
  children?: React.ReactNode;
}

function VideoListLoader({ repeatCount, children }: VideoListLoaderProps) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-4 lg:grid-cols-3 xl:gap-x-4 xl:grid-cols-4 2xl:grid-cols-5"
    >
      {children}
      {renderSkeletonItems(repeatCount)}
    </ul>
  );
}

export default VideoListLoader;
