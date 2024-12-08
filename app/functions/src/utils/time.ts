import { Timestamp, FieldValue } from "firebase-admin/firestore";

export const getTimestamp = (): FieldValue => {
  return Timestamp.now();
};
