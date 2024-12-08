import * as admin from "firebase-admin";
import { CollectionReference, DocumentData } from "firebase-admin/firestore";
import { Collections } from "../constants/collections";

export const getVideoReportsCollection = (): CollectionReference<DocumentData> => {
  return admin.firestore().collection(Collections.VIDEOS_REPORTS);
};
