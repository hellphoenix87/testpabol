import * as admin from "firebase-admin";
import { WriteResult } from "firebase-admin/firestore";
import { Scene } from "../schema/Scene.schema";
import { Character } from "../schema/Character.schema";
import { Location } from "../schema/Location.schema";
import { AnimatedShots, CreationMeta } from "../schema/CreationMeta.schema";
import { Shot } from "../schema/Shot.schema";
import { TitlePlot } from "../schema/TitlePlot.schema";
import { getFallbackAssets, getValidOrderAndSortData } from "../utils/utils";
import * as collectionGetters from "./collectionGetters";
import { assetsOrderNames } from "../constants/assetsOrderNames";
import { NEW_SHOT_ID } from "../../../shared";
import { getTimestamp } from "../utils/time";

enum AssetType {
  CHARACTERS = "characters",
  LOCATIONS = "locations",
}

export type Asset<T> = T extends AssetType.CHARACTERS ? Character : Location;

export const getCreationData = async (
  uid: string,
  creationId: string
): Promise<(CreationMeta & TitlePlot & { id: string }) | null> => {
  const creation = await collectionGetters.getCreationSnapshot(uid, creationId);

  if (!creation.exists) {
    return null;
  }

  const creationData = creation.data() as CreationMeta & TitlePlot;

  return { id: creation.id, ...creationData };
};

// Get the list of assets for a creation
export const getAssetsListData = async <T extends AssetType>(
  uid: string,
  creationId: string,
  type: T
): Promise<Array<Asset<T>>> => {
  const isCharacters = type === AssetType.CHARACTERS;
  const orderKey = isCharacters ? assetsOrderNames.CHARACTERS : assetsOrderNames.LOCATIONS;
  const docsGetter = isCharacters
    ? collectionGetters.getCharacterListSnapshot
    : collectionGetters.getLocationListSnapshot;
  const [creation, assets] = await Promise.all([getCreationData(uid, creationId), docsGetter(uid, creationId)]);

  if (!creation) {
    return [];
  }

  const originOrder = creation[orderKey] || [];
  const { fallbackAssetsList, assetsWithoutFallbacks } = getFallbackAssets<Asset<T>>(assets.docs);

  const { order, dataList } = getValidOrderAndSortData<Asset<T>>(assetsWithoutFallbacks, originOrder);
  const isDataListValidToOrder = originOrder.length === dataList.length;

  if (!isDataListValidToOrder) {
    await setCreationData(uid, creationId, { [orderKey]: order });
  }

  return [...dataList, ...fallbackAssetsList];
};

// Get the list of characters for a creation
export const getCharactersListData = async (uid: string, creationId: string): Promise<Character[]> => {
  return await getAssetsListData(uid, creationId, AssetType.CHARACTERS);
};

// Get a character
export const getCharacterData = async (uid: string, creationId: string, characterId: string): Promise<Character> => {
  const character = await collectionGetters.getCharacterSnapshot(uid, creationId, characterId);
  return character.data() as Character;
};

// Get the list of locations for a creation
export const getLocationsListData = async (uid: string, creationId: string): Promise<Location[]> => {
  return await getAssetsListData(uid, creationId, AssetType.LOCATIONS);
};

// Get a location
export const getLocationData = async (uid: string, creationId: string, locationId: string): Promise<Location> => {
  const location = await collectionGetters.getLocationSnapshot(uid, creationId, locationId);
  return location.data() as Location;
};

export const getShotListData = async (uid: string, creationId: string, sceneId: string): Promise<Shot[]> => {
  const [scene, shots] = await Promise.all([
    collectionGetters.getSceneData(uid, creationId, sceneId),
    collectionGetters.getShotListSnapshot(uid, creationId, sceneId),
  ]);

  if (!scene) {
    return [];
  }

  const originOrder = scene.shots_order || [];
  const { order, dataList } = getValidOrderAndSortData<Shot>(shots.docs, originOrder);
  const isDataListValidToOrder = originOrder.length === dataList.length;

  if (!isDataListValidToOrder) {
    await setSceneData(uid, creationId, { id: scene.id, shots_order: order });
  }

  return dataList;
};

export const getScenesListData = async (uid: string, creationId: string): Promise<Scene[]> => {
  const creation = await getCreationData(uid, creationId);

  if (!creation) {
    return [];
  }

  const scenesRef = await collectionGetters.getScenesSnapshot(uid, creationId);
  const scenesOrder = creation.scenes_order ?? [];

  const { order, dataList } = getValidOrderAndSortData<Scene>(scenesRef.docs, scenesOrder);

  const isDataListValidToOrder = scenesOrder.length === dataList.length;

  if (!isDataListValidToOrder) {
    await setCreationData(uid, creationId, { scenes_order: order });
  }

  const scenesPromises = dataList.map(async scene => {
    const shots = await getShotListData(uid, creationId, scene.id);
    return { ...scene, shots };
  });

  return await Promise.all(scenesPromises);
};

export const getScenesCount = async (uid: string, creationId: string): Promise<number> => {
  const scenesRef = await collectionGetters.getScenesSnapshot(uid, creationId);
  return scenesRef.size;
};

export const getAnimatedShotsStatus = async (uid: string, creationId: string): Promise<AnimatedShots> => {
  const creation = await getCreationData(uid, creationId);
  return creation?.animatedShots || {};
};

export const setAnimatedShotsStatus = async (uid: string, creationId: string, key: string): Promise<void> => {
  await collectionGetters.getCreationDoc(uid, creationId).update({ [`animatedShots.${key}.isGenerated`]: true });
};

// Set the creation data
export const setCreationData = async (
  uid: string,
  creationId: string,
  creation: Partial<CreationMeta & TitlePlot>
): Promise<void> => {
  await collectionGetters.getCreationDoc(uid, creationId).set({ ...creation }, { merge: true });
};

// Set a list of scenes
export const setScenesData = async (
  uid: string,
  creationId: string,
  scenes: Array<Partial<Scene> & { id: string }>
): Promise<void> => {
  await Promise.all([
    setCreationData(uid, creationId, { scenes_order: scenes.map(scene => scene.id) }),
    ...scenes.map(scene => setSceneData(uid, creationId, scene)),
  ]);
};

// Set scene
export const setSceneData = async (
  uid: string,
  creationId: string,
  { shots, ...scene }: Partial<Omit<Scene, "shots"> & { shots?: Array<Partial<Shot>> }> & { id: string }
): Promise<WriteResult[]> => {
  const batch = admin.firestore().batch();
  const updatedTime = getTimestamp();
  const sceneRef = collectionGetters.getSceneDoc(uid, creationId, scene.id);

  const newScene = { ...scene, updated_at: updatedTime };

  if (shots) {
    newScene.shots_order = scene.shots_order ?? shots.map(shot => shot.id!);
    await setShotListData({ uid, creationId, sceneId: scene.id, shots });
  }

  // Save scene without shots
  batch.set(sceneRef, newScene, { merge: true });

  return batch.commit();
};

export const setShotListData = async ({
  uid,
  creationId,
  sceneId,
  shots = [],
}: {
  uid: string;
  creationId: string;
  sceneId: string;
  shots?: Array<Partial<Shot>>;
}): Promise<void> => {
  const batch = admin.firestore().batch();
  const updatedTime = getTimestamp();

  shots?.forEach((shot: Partial<Shot>) => {
    const shotRef = collectionGetters.getShotDoc(uid, creationId, sceneId, shot.id!);
    batch.set(shotRef, { ...shot, updated_at: updatedTime }, { merge: true });
  });

  await batch.commit();
};

export const setShotData = async ({
  uid,
  creationId,
  sceneId,
  shotIndex,
  shot,
}: {
  uid: string;
  creationId: string;
  sceneId: string;
  shotIndex?: number;
  shot: Partial<Shot> & { id: string };
}): Promise<Partial<Shot>> => {
  const updatedTime = getTimestamp();

  if (shot.id && shot.id !== NEW_SHOT_ID) {
    const shotRef = collectionGetters.getShotDoc(uid, creationId, sceneId, shot.id);
    await shotRef.set({ ...shot, updated_at: updatedTime }, { merge: true });
    return shot;
  }

  if (typeof shotIndex !== "number") {
    throw new Error("shotIndex is required for new shots");
  }

  const shotListRef = collectionGetters.getShotListDoc(uid, creationId, sceneId);
  const sceneData = await collectionGetters.getSceneData(uid, creationId, sceneId);
  const shotDoc = await shotListRef.add({ ...shot, dialog: [], created_at: updatedTime });

  const shotsOrder = sceneData?.shots_order ?? [];

  // Update shots order
  shotsOrder.splice(shotIndex, 0, shotDoc.id);
  await setSceneData(uid, creationId, { id: sceneId, shots_order: shotsOrder });

  // Save shot's id
  await shotDoc.set({ id: shotDoc.id, updated_at: updatedTime, created_at: updatedTime }, { merge: true });

  return { ...shot, id: shotDoc.id };
};

export const saveTitleAndScenes = async ({
  uid,
  creationId,
  title,
  scenes,
}: {
  uid: string;
  creationId: string;
  title: string;
  scenes: Array<{ id: string } & Partial<Scene>>;
}) => {
  const batch = admin.firestore().batch();
  const sceneListRef = collectionGetters.getSceneListDoc(uid, creationId);
  const scenesOrder = scenes.map(scene => scene.id);

  await setCreationData(uid, creationId, { title, scenes_order: scenesOrder });

  for (let index = 0; index < scenes.length; index++) {
    const scene = scenes[index];
    const sceneRef = sceneListRef.doc(scene.id);
    batch.set(sceneRef, scenes[index]);
  }

  await batch.commit();
};
