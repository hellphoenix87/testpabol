import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import useLoginDialog from "@app/hooks/useLoginDialog";

export enum NotAllowedTypeEnum {
  AGE_RESTRICTION = "AGE_RESTRICTION",
  NONE = "NONE",
}

interface VideoSkeletonProps {
  notAllowedType?: NotAllowedTypeEnum | null;
}

export default function VideoSkeleton({ notAllowedType }: VideoSkeletonProps) {
  const { handleLoginOpen } = useLoginDialog();

  const signInLink = (
    <a href="#" className="text-indigo-600 hover:text-indigo-500 font-bold" onClick={() => handleLoginOpen(true)}>
      sign in
    </a>
  );

  const renderError = type => {
    if (type === NotAllowedTypeEnum.AGE_RESTRICTION) {
      return (
        <div className="text-white h-[60vh] max-h-100" data-testid="adult-content-container">
          <div className="flex items-center justify-center flex-col h-full text-center">
            <p>
              <ExclamationTriangleIcon className="mr-3 h-12 w-12 text-red-400 inline" />
              <span className="self-end font-bold">This movie is age restricted</span>
            </p>
            <p>This movie content may be inappropriate for some viewers. </p>
            <p>Please {signInLink} to confirm your age.</p>
          </div>
        </div>
      );
    }
  };

  if (notAllowedType) {
    return renderError(notAllowedType);
  }

  return (
    <div className="animate-pulse mx-auto max-w-[110vh] w-full overflow-hidden">
      <div
        data-testid="skeleton-loader"
        className="bg-white bg-opacity-10 aspect-w-16 aspect-h-9 rounded-md
        before:absolute before:inset-0
        before:-translate-x-full
        before:animate-[shimmer_2s_infinite]
        before:bg-gradient-to-r
        before:from-transparent
        before:via-rose-100/20
        before:to-transparent"
      />
    </div>
  );
}
