export const getInteractionId = (
  uid: string,
  videoId: string,
  commentId: string | null = null,
  subcommentId: string | null = null
) => {
  if (commentId === null) {
    return `${uid}-${videoId}`;
  }

  if (subcommentId === null) {
    return `${uid}-${videoId}-${commentId}`;
  }

  return `${uid}-${videoId}-${commentId}-${subcommentId}`;
};
