import * as admin from "firebase-admin";

import { Collections } from "../constants/collections";
import { CollectionReference, DocumentData } from "firebase-admin/firestore";

export interface Attachment {
  filename: string;
  path: string;
}

export interface Mail {
  uid: string;
  to: string[];
  message: {
    subject: string;
    html: string;
    attachments: Array<Attachment> | null;
  };
}

export const getMailsCollection = (): CollectionReference<DocumentData> => {
  return admin.firestore().collection(Collections.MAIL);
};

export const addMail = async (data: any): Promise<void> => {
  await getMailsCollection().add(data);
};
