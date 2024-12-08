import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { setCreationData } from "../../../DB/creationRepository";
import { Collections } from "../../../constants/collections";
import { getTimestamp } from "../../../utils/time";
import { VideoStatus } from "../../../../../shared/types/Video";

const defaultVideoValues = {
  checked_by_moderation: false,
  views: 0,
  software_version: "1.0",
  likes: 0,
  dislikes: 0,
  status: VideoStatus.PENDING,
};

// Set creation to completed when video generation is triggered
const updateCreationComplete = async (uid: string, creationId: string): Promise<void> => {
  try {
    await setCreationData(uid, creationId, { completed: true });
  } catch (error) {
    logger.error(error);
    throw new Error("Failed to update creation complete");
  }
};

export const createNewVideoRecord = async ({
  uid,
  creationId,
  title,
  description,
  tags,
  genre,
  audience,
  isAgeRestricted,
}: {
  uid: string;
  creationId: string;
  title: string;
  description: string;
  tags: string[];
  genre: string;
  audience: string;
  isAgeRestricted: boolean;
}): Promise<void> => {
  // Set creation to completed
  await updateCreationComplete(uid, creationId);

  const serverTimestamp = getTimestamp();
  // Save video doc to firestore
  await admin
    .firestore()
    .collection(Collections.VIDEOS)
    .doc(creationId)
    .set({
      ...defaultVideoValues,
      id: creationId,
      author: uid,
      title,
      description,
      genre,
      audience,
      tags,
      thumbnail_images_url: [],
      isAgeRestricted,
      deleted: false,
      created_at: serverTimestamp,
      updated_at: serverTimestamp,
    });
};
