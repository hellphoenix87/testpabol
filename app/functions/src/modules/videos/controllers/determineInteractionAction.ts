import { Actions } from "../../../../../shared/constants/actions";

export const determineInteractionAction = (previousAction: Actions | null, action: Actions | null) => {
  let incrementLikes = false;
  let incrementDislikes = false;
  let decrementLikes = false;
  let decrementDislikes = false;

  // If user has not interacted with the video before
  if (!previousAction) {
    if (action === Actions.LIKE) {
      incrementLikes = true;
    } else if (action === Actions.DISLIKE) {
      incrementDislikes = true;
    }
    return { incrementLikes, incrementDislikes, decrementLikes, decrementDislikes };
  }

  // If user has interacted with the video before
  // If the user already liked the video
  if (previousAction === Actions.LIKE) {
    // If the action is DISLIKE, decrement likes and increment dislikes
    if (action === Actions.DISLIKE) {
      decrementLikes = true;
      incrementDislikes = true;
    }
    // Remove the like
    else if (action === Actions.LIKE) {
      decrementLikes = true;
    }
    return { incrementLikes, incrementDislikes, decrementLikes, decrementDislikes };
  }

  // If the user already disliked the video
  if (previousAction === Actions.DISLIKE) {
    // If the action is LIKE, decrement dislikes and increment likes
    if (action === Actions.LIKE) {
      decrementDislikes = true;
      incrementLikes = true;
    }
    // Remove the dislike
    else if (action === Actions.DISLIKE) {
      decrementDislikes = true;
    }
  }

  return { incrementLikes, incrementDislikes, decrementLikes, decrementDislikes };
};
