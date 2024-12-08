import admin from "firebase-admin";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { getLogMessage } from "../utils/utils";
import { Video, VideoStatus } from "../../../shared/types/Video";

const validateVideo = (video?: Video) => {
  if (!video) {
    return "Video was deleted from the videos collection";
  }

  if (video.deleted) {
    return 'Video was deleted by adding flag "deleted=true" to the video';
  }

  if (video.status !== VideoStatus.READY) {
    return "Video is not ready";
  }

  if (!video.checked_by_moderation) {
    return "Video was not checked by moderation";
  }

  if (!video.accepted) {
    return "Video was not accepted by moderation";
  }

  return "";
};

export const updateSearch = onDocumentWritten("videos/{videoId}", async event => {
  const batch = admin.firestore().batch();
  const { videoId } = event.params;
  const oldVideo = event.data?.before.data();
  const video = event.data?.after.data() as Video | undefined;
  const errorMsg = validateVideo(video);

  if (
    video &&
    oldVideo &&
    video.title === oldVideo.title &&
    video.description === oldVideo.description &&
    video.deleted === oldVideo.deleted &&
    video.status === oldVideo.status &&
    video.checked_by_moderation === oldVideo.checked_by_moderation &&
    video.accepted === oldVideo.accepted
  ) {
    console.log(
      getLogMessage(`Video with ID ${videoId} was not changed. Search collection was not updated.`, { videoId })
    );
    return;
  }

  console.log(getLogMessage(`Updating search collection for video with ID ${videoId}`, { videoId }));

  if (errorMsg.length > 0) {
    console.log(
      getLogMessage(`Removing video with ID ${videoId} from search collection by reason "${errorMsg}".`, {
        videoId,
        reason: errorMsg,
      })
    );
    batch.delete(admin.firestore().collection("search").doc(videoId));
  } else {
    console.log(getLogMessage(`Adding video with ID ${videoId} to search collection`, { videoId }));
    const searchRef = admin.firestore().collection("search").doc(videoId);
    batch.set(searchRef, { id: videoId, title: video!.title, description: video!.description });
  }

  await batch.commit();
  console.log(getLogMessage(`Search collection was updated for video with ID: ${videoId}`, { videoId }));
});
