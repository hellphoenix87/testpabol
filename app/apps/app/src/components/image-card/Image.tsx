import { useEffect } from "react";
import { classNames } from "@frontend/utils/classNames";

export function Image({ src, isVisible, onLoadingUpdate }) {
  const handleImageLoad = (): void => {
    onLoadingUpdate(false);
  };

  const handleImageError = (): void => {
    onLoadingUpdate(false);
  };

  useEffect(() => {
    if (!src) {
      onLoadingUpdate?.(false);
    }
  }, [src]);

  return (
    <img
      className={classNames("pointer-events-none object-cover", isVisible ? "opacity-100" : "opacity-0")}
      src={src}
      alt="Thumbnail image"
      onLoad={handleImageLoad}
      onError={handleImageError}
    />
  );
}
