import * as admin from "firebase-admin";
import { CollectionReference, DocumentData, DocumentReference } from "firebase-admin/firestore";
import { Collections } from "../constants/collections";
import { getTimestamp } from "../utils/time";

interface Creator {
  uid: string;
  email: string;
  currentcreation: number;
  created_at: Date;
}

export const getCreators = (): CollectionReference<DocumentData> => {
  return admin.firestore().collection(Collections.CREATORS);
};

export const getCreatorDoc = (uid: string): DocumentReference<DocumentData> => {
  return getCreators().doc(uid);
};

export const setCreatorData = async (uid: string, data: Partial<Creator>): Promise<void> => {
  await getCreatorDoc(uid).set({ ...data, updated_at: getTimestamp() }, { merge: true });
};

export const deleteCreator = async (uid: string): Promise<void> => {
  await getCreatorDoc(uid).delete();
};
