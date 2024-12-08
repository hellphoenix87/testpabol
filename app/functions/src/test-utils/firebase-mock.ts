import { CollectionReference, DocumentReference } from "firebase-admin/firestore";

export const dataSpy = jest.fn<any, any[]>(() => null);

export const getSpy: any = jest.fn(() => Promise.resolve({ data: dataSpy, exists: true }));

export const setSpy: any = jest.fn(() => Promise.resolve());

export const deleteSpy = jest.fn(() => Promise.resolve());

export const docSpy: () => DocumentReference = jest.fn(() => ({
  get: getSpy,
  set: setSpy,
  delete: deleteSpy,
  collection: collectionSpy,
})) as unknown as () => DocumentReference;

const collectionSpy: () => CollectionReference = jest.fn(() => ({
  doc: docSpy,
  get: getSpy,
})) as unknown as () => CollectionReference;

const fieldValueSpy = { serverTimestamp: dataSpy };

const firestoreSpy = jest.fn(() => ({ collection: collectionSpy, batch: jest.fn().mockReturnValue(batchSpy) }));

// attach a property to the mocked method as firestore method
(firestoreSpy as any).FieldValue = fieldValueSpy;

const verifyIdTokenSpy = jest.fn<any, any>(() => Promise.resolve(null));

const authSpy = jest.fn(() => ({ verifyIdToken: verifyIdTokenSpy }));

const batchSpy: any = {
  set: setSpy,
  update: jest.fn(),
  commit: jest.fn(),
  delete: deleteSpy,
};

export const firestoreAdmin = {
  initializeApp: jest.fn(),
  firestore: firestoreSpy,
  dataSpy,
  getSpy,
  setSpy,
  docSpy,
  collectionSpy,
  firestoreSpy,
  auth: authSpy,
  verifyIdTokenSpy,
  batchSpy,
  deleteSpy,
};
