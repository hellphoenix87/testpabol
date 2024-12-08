import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  WriteResult,
} from "firebase-admin/firestore";
import { Collections } from "../constants/collections";
import { getUserDoc } from "./usersCollection";

export const getVideoInteractionsCollection = (uid: string): CollectionReference<DocumentData> => {
  return getUserDoc(uid).collection(Collections.VIDEO_INTERACTIONS);
};

export const getVideoInteractionsCollectionSnapshot = async (uid: string): Promise<QuerySnapshot<DocumentData>> => {
  return await getVideoInteractionsCollection(uid).get();
};

export const getInteractionDoc = (uid: string, interactionId: string): DocumentReference<DocumentData> => {
  return getVideoInteractionsCollection(uid).doc(interactionId);
};

export const getInteractionSnapshot = async (
  uid: string,
  interactionId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return await getInteractionDoc(uid, interactionId).get();
};

export const getInteractionData = async (uid: string, interactionId: string): Promise<DocumentData | null> => {
  const interaction = await getInteractionSnapshot(uid, interactionId);
  return interaction.data() ?? null;
};

export const getVideosInteractionsCount = async (
  uid: string
): Promise<{ videosLikes: number; videosDislikes: number }> => {
  const videoInteractions = await getVideoInteractionsCollectionSnapshot(uid);
  let videosLikes = 0;
  let videosDislikes = 0;

  for (const doc of videoInteractions.docs) {
    const { action } = doc.data();

    if (action === "like") {
      videosLikes += 1;
    } else if (action === "dislike") {
      videosDislikes += 1;
    }
  }

  return { videosLikes, videosDislikes };
};

export const setInteractionData = async (uid: string, interactionId: string, data: any): Promise<WriteResult> => {
  return await getInteractionDoc(uid, interactionId).set(data);
};

export const deleteInteraction = async (uid: string, interactionId: string): Promise<WriteResult> => {
  return await getInteractionDoc(uid, interactionId).delete();
};
