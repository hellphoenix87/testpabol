import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/solid";
import { classNames } from "@frontend/utils/classNames";
import { checkImageLoading } from "@app/util";

interface ImageWithSpinnerProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export default function ImageWithSpinner({ src, alt, className, onClick }: ImageWithSpinnerProps) {
  const [loading, setLoading] = useState(!src || checkImageLoading(src));

  return (
    <div className={classNames("relative overflow-hidden", loading && "bg-gray-200", className)} onClick={onClick}>
      {loading && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6"
          data-testid="image-spinner"
        >
          <ArrowPathIcon className="w-full h-full animate-spin" />
        </div>
      )}

      <img
        src={checkImageLoading(src) ? "" : src}
        alt={alt}
        className={classNames("object-cover", loading && "hidden")}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(true)}
      />
    </div>
  );
}
