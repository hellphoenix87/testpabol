import { HandThumbUpIcon, HandThumbDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";
import { classNames } from "@frontend/utils/classNames";
import useLoginDialog from "@app/hooks/useLoginDialog";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { logger } from "@app/utils/logger";
import { Actions } from "@shared/constants/actions";

interface RateIconsProps {
  videoId?: string;
  likes: number;
  dislikes: number;
  userInteraction?: {
    action: Actions;
  };
}

// Component for like and dislike buttons
export function RateIcons({ videoId, likes, dislikes, userInteraction }: RateIconsProps) {
  const [likeCount, setLikeCount] = useState<number>(likes);
  const [dislikeCount, setDislikeCount] = useState<number>(dislikes);
  const [userInteractionAction, setUserInteractionAction] = useState<Actions | null>(userInteraction?.action ?? null);
  const [highlightedButton, setHighlightedButton] = useState<Actions | null>(userInteraction?.action ?? null);
  const [disabledButtons, setDisabledButtons] = useState<boolean>(false);

  const { handleLoginOpenWithAuth } = useLoginDialog();

  const handleLikeClick = async (): Promise<void> => {
    // Open login dialog if user is not logged in
    const dialogOpened = handleLoginOpenWithAuth(true);
    if (dialogOpened) {
      return;
    }

    setDisabledButtons(true);

    if (userInteractionAction === Actions.LIKE) {
      // Decrement likes when like button is already selected
      setLikeCount(currentLikesCount => currentLikesCount - 1);
      setHighlightedButton(null);
    } else {
      // Increment likes and decrement dislikes if necessary
      setLikeCount(currentLikesCount => currentLikesCount + 1);
      if (userInteractionAction === Actions.DISLIKE) {
        setDislikeCount(currentDislikesCount => currentDislikesCount - 1);
      }
      setHighlightedButton(Actions.LIKE);
    }

    try {
      const result = await callMicroservice(firebaseMethods.UPDATE_VIDEO_LIKES_DISLIKES, {
        id: videoId,
        action: Actions.LIKE,
      });
      setUserInteractionAction(result.action);
    } catch (error) {
      logger.error(error);
    } finally {
      setDisabledButtons(false);
    }
  };

  const handleDislikeClick = async (): Promise<void> => {
    // Open login dialog if user is not logged in
    const dialogOpened = handleLoginOpenWithAuth(true);
    if (dialogOpened) {
      return;
    }

    setDisabledButtons(true);

    if (userInteractionAction === Actions.DISLIKE) {
      // Decrement dislikes when dislike button is already selected
      setDislikeCount(currentDislikesCount => currentDislikesCount - 1);
      setHighlightedButton(null);
    } else {
      // Increment dislikes and decrement likes if necessary
      setDislikeCount(currentDislikesCount => currentDislikesCount + 1);
      if (userInteractionAction === Actions.LIKE) {
        setLikeCount(currentLikesCount => currentLikesCount - 1);
      }
      setHighlightedButton(Actions.DISLIKE);
    }

    try {
      const result = await callMicroservice(firebaseMethods.UPDATE_VIDEO_LIKES_DISLIKES, {
        id: videoId,
        action: Actions.DISLIKE,
      });
      setUserInteractionAction(result.action);
    } catch (error) {
      logger.error(error);
    } finally {
      setDisabledButtons(false);
    }
  };

  return (
    <span className="isolate inline-flex rounded-md shadow-sm h-8">
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center rounded-l-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 outline-none",
          highlightedButton === Actions.LIKE ? "bg-gray-200" : "bg-white hover:bg-gray-100"
        )}
        disabled={disabledButtons}
        onClick={handleLikeClick}
      >
        <HandThumbUpIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
        {likeCount}
      </button>
      <button
        type="button"
        className={classNames(
          "relative inline-flex items-center rounded-r-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 outline-none",
          highlightedButton === Actions.DISLIKE ? "bg-gray-200" : "bg-white hover:bg-gray-100"
        )}
        disabled={disabledButtons}
        onClick={handleDislikeClick}
      >
        <HandThumbDownIcon className="-ml-1 mr-2 h-4 w-4 text-gray-400" aria-hidden="true" />
        {dislikeCount}
      </button>
    </span>
  );
}
