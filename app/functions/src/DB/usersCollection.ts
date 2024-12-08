import * as admin from "firebase-admin";
import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  FieldValue,
  WriteResult,
} from "firebase-admin/firestore";

import { User } from "../types/User";
import { Collections } from "../constants/collections";

import { getTimestamp } from "../utils/time";
import { deleteCreator } from "./creatorsCollection";

export const getUserListCollection = (): CollectionReference<DocumentData> => {
  return admin.firestore().collection(Collections.USERS);
};

export const getUserListSnapshot = async () => {
  return await getUserListCollection().get();
};

export const getUserDoc = (userId: string): DocumentReference<DocumentData> => {
  return getUserListCollection().doc(userId);
};

export const getUserSnapshot = async (userId: string): Promise<DocumentSnapshot<DocumentData>> => {
  return await getUserDoc(userId).get();
};

export const getUserData = async (userId: string): Promise<User> => {
  const userSnapshot = await getUserSnapshot(userId);
  return userSnapshot.data() as User;
};

export const setUserData = async (
  userId: string,
  data: Partial<User | { created_at: FieldValue }>
): Promise<WriteResult> => {
  return await getUserDoc(userId).set({ ...data, updated_at: getTimestamp() }, { merge: true });
};

export const deleteUser = async (userId: string): Promise<void> => {
  await Promise.all([deleteCreator(userId), getUserDoc(userId).delete()]);
};
