import * as admin from "firebase-admin";
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  Query,
} from "firebase-admin/firestore";
import { VideoStatus, Video } from "../../../shared/types/Video";

import { VideoFilters } from "../constants/videoFilters";
import { Collections } from "../constants/collections";

import { getTimestamp } from "../utils/time";

type ArgType = CollectionReference<DocumentData> | Query<DocumentData>;

export const getVideosCollection = (): CollectionReference<DocumentData> => {
  return admin.firestore().collection(Collections.VIDEOS);
};

export const getVideoDoc = (videoId: string): DocumentReference<DocumentData> => {
  return getVideosCollection().doc(videoId);
};

export const getVideoSnapshot = async (videoId: string): Promise<DocumentSnapshot<DocumentData>> => {
  return await getVideoDoc(videoId).get();
};

export const getVideoData = async (videoId: string): Promise<Video | null> => {
  const video = await getVideoSnapshot(videoId);
  return video.data() as Video | null;
};

export const setVideoData = async (videoId: string, data: Partial<Video | Record<keyof Video, FieldValue>>) => {
  return await getVideoDoc(videoId).set({ ...data, updated_at: getTimestamp() }, { merge: true });
};

export const filterVideos = {
  [VideoFilters.ALL]: (videos: ArgType): ArgType => {
    return videos;
  },
  [VideoFilters.WAITING_FOR_REVIEW]: (videos: ArgType): ArgType => {
    return videos.where("checked_by_moderation", "==", false).where("deleted", "==", false);
  },
  [VideoFilters.PUBLISHED]: (videos: ArgType): ArgType => {
    return videos
      .where("checked_by_moderation", "==", true)
      .where("accepted", "==", true)
      .where("deleted", "==", false);
  },
  [VideoFilters.REJECTED]: (videos: ArgType): ArgType => {
    return videos
      .where("checked_by_moderation", "==", true)
      .where("accepted", "==", false)
      .where("deleted", "==", false);
  },
  [VideoFilters.FAILED]: (videos: ArgType): ArgType => {
    return videos.where("status", "==", VideoStatus.FAILED);
  },
  [VideoFilters.DELETED]: (videos: ArgType): ArgType => {
    return videos.where("deleted", "==", true);
  },
};
