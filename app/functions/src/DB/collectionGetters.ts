import {
  CollectionReference,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
} from "firebase-admin/firestore";
import { Collections } from "../constants/collections";
import { Scene } from "../schema/Scene.schema";
import { Shot } from "../schema/Shot.schema";
import { CreationMeta } from "../schema/CreationMeta.schema";
import { TitlePlot } from "../schema/TitlePlot.schema";
import { getCreatorDoc } from "./creatorsCollection";

export const getCreationListDoc = (uid: string): CollectionReference<DocumentData> => {
  return getCreatorDoc(uid).collection(Collections.CREATIONS);
};

export const getCreationListSnapshot = async (uid: string): Promise<QuerySnapshot<DocumentData>> => {
  return await getCreationListDoc(uid).get();
};

export const getCreationsCount = async (uid: string): Promise<number> => {
  const snapshot = await getCreationListSnapshot(uid);
  return snapshot.docs.length;
};

export const getCreationDoc = (uid: string, creationId: string): DocumentReference<DocumentData> => {
  return getCreationListDoc(uid).doc(creationId);
};

export const getCreationSnapshot = async (
  uid: string,
  creationId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return await getCreationDoc(uid, creationId).get();
};

export const getCreationData = async (uid: string, creationId: string): Promise<(CreationMeta & TitlePlot) | null> => {
  const creation = await getCreationSnapshot(uid, creationId);

  if (!creation.exists) {
    return null;
  }

  return creation.data() as CreationMeta & TitlePlot;
};

export const getCharacterListDoc = (uid: string, creationId: string): CollectionReference<DocumentData> => {
  return getCreationDoc(uid, creationId).collection(Collections.CHARACTERS);
};

export const getCharacterListSnapshot = async (
  uid: string,
  creationId: string
): Promise<QuerySnapshot<DocumentData>> => {
  return getCharacterListDoc(uid, creationId).get();
};

export const getCharacterDoc = (
  uid: string,
  creationId: string,
  characterId: string
): DocumentReference<DocumentData> => {
  return getCharacterListDoc(uid, creationId).doc(characterId);
};

export const getCharacterSnapshot = (
  uid: string,
  creationId: string,
  characterId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return getCharacterDoc(uid, creationId, characterId).get();
};

export const getLocationListDoc = (uid: string, creationId: string): CollectionReference<DocumentData> => {
  return getCreationDoc(uid, creationId).collection(Collections.LOCATIONS);
};

export const getLocationListSnapshot = (uid: string, creationId: string): Promise<QuerySnapshot<DocumentData>> => {
  return getLocationListDoc(uid, creationId).get();
};

export const getLocationDoc = (
  uid: string,
  creationId: string,
  locationId: string
): DocumentReference<DocumentData> => {
  return getLocationListDoc(uid, creationId).doc(locationId);
};

export const getLocationSnapshot = (
  uid: string,
  creationId: string,
  locationId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return getLocationDoc(uid, creationId, locationId).get();
};

export const getSceneListDoc = (uid: string, creationId: string): CollectionReference<DocumentData> => {
  return getCreationDoc(uid, creationId).collection(Collections.SCENES);
};

export const getScenesSnapshot = (uid: string, creationId: string): Promise<QuerySnapshot<DocumentData>> => {
  return getSceneListDoc(uid, creationId).get();
};

export const getSceneDoc = (uid: string, creationId: string, sceneId: string): DocumentReference<DocumentData> => {
  return getSceneListDoc(uid, creationId).doc(sceneId);
};

export const getSceneSnapshot = (
  uid: string,
  creationId: string,
  sceneId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return getSceneDoc(uid, creationId, sceneId).get();
};

export const getSceneData = async (uid: string, creationId: string, sceneId: string): Promise<Scene | null> => {
  const scene = await getSceneSnapshot(uid, creationId, sceneId);

  if (!scene.exists) {
    return null;
  }

  return scene.data() as Scene;
};

export const getShotListDoc = (
  uid: string,
  creationId: string,
  sceneId: string
): CollectionReference<DocumentData> => {
  return getSceneDoc(uid, creationId, sceneId).collection(Collections.SHOTS);
};

export const getShotListSnapshot = (
  uid: string,
  creationId: string,
  sceneId: string
): Promise<QuerySnapshot<DocumentData>> => {
  return getShotListDoc(uid, creationId, sceneId).get();
};

export const getShotDoc = (
  uid: string,
  creationId: string,
  sceneId: string,
  shotId: string
): DocumentReference<DocumentData> => {
  return getShotListDoc(uid, creationId, sceneId).doc(shotId);
};

export const getShotSnapshot = (
  uid: string,
  creationId: string,
  sceneId: string,
  shotId: string
): Promise<DocumentSnapshot<DocumentData>> => {
  return getShotDoc(uid, creationId, sceneId, shotId).get();
};

export const getShotData = async (
  uid: string,
  creationId: string,
  sceneId: string,
  shotId: string
): Promise<Shot | null> => {
  const shot = await getShotSnapshot(uid, creationId, sceneId, shotId);
  return (shot.data() as Shot) ?? null;
};
