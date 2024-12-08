import dotenv from "dotenv";
import * as admin from "firebase-admin";
import { Storage } from "@google-cloud/storage";
import { DocumentSnapshot, DocumentData, QueryDocumentSnapshot } from "firebase-admin/firestore";
import path from "path";
import { FALLBACK_CHARACTER_NAME } from "../../../shared";

dotenv.config();

const storage = new Storage();

/**
 * Finds an element in a sorted array using the Binary Search algorithm.
 *
 * @param {Array<Object>} arr - The sorted array in which the target element will be searched.
 * @param {*} target - The value of the target element to be found.
 * @param {string} propsName - The name of the property within each element of the array to compare with the target value.
 * @returns {*} - The element from the array that matches the target value, or null if not found.
 */
export const findElementBinary = (
  arr: DocumentSnapshot<DocumentData>[],
  target: string | number,
  propsName: string
): DocumentData | null => {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    const midElement = arr[mid].data();

    if (!midElement) {
      return null;
    }

    const midValue = midElement[propsName];

    if (midValue === target) {
      return midElement;
    }

    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return null;
};

/**
 * Get a random value from a list.
 *
 * @param {Array<Object>} list - The list that we want to get an element from.
 * @returns {Object} - A random value from the list.
 */
export const getRandomValueFromList = <T = object>(list: T[]): T => {
  return list[Math.floor(Math.random() * list.length)];
};

// Returns a 8 character alphanumeric random string
export const getRandomId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Prepend the commit hash (revision) to the function name
export const prependRev = (functionName: string): string => {
  // must start with a letter: R for revision
  return "R" + process.env.__COMMIT_HASH__! + "_" + functionName;
};

// Returns a stringified JSON object with the message and other info for logging
export const getLogMessage = (message: string, otherInfo = {}): string => {
  return JSON.stringify({ message, ...otherInfo });
};

// Get a random Avatar image from the public storage bucket
export const getRandomAvatarImage = async (): Promise<string> => {
  const prefix = "avatars/";
  const [files] = await storage.bucket(process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE!).getFiles({
    prefix,
  });

  return getRandomValueFromList(files.filter(file => file.name !== prefix)).name;
};

export const validateProjectId = () => {
  const projectId = admin.instanceId().app.options.projectId;

  if (projectId && projectId !== process.env.PABOLO_PROJECT_ID) {
    console.error(
      `\x1b[1;31m⬢  Error: Invalid project ID. Did you forget to run "firebase use default"?\n    Actual projectID: ${projectId}\n    Expected projectID: ${process.env.PABOLO_PROJECT_ID}\x1b[0m`
    );
  }
};

export const sortListByIds = <T extends { id: string }>(ids: string[] = [], list: Array<T>): T[] => {
  return [...list].sort((a, b) => {
    return ids.indexOf(a.id) - ids.indexOf(b.id);
  });
};

export const getAssetOrder = (assetsIds: string[]): number => {
  return assetsIds?.length || 0;
};

export const getListOrderWithMissingIds = <T extends { id: string }>(list: T[], listOrder: string[]): string[] => {
  return list.reduce(
    (acc, asset) => {
      if (!listOrder.includes(asset.id)) {
        acc.push(asset.id);
      }
      return acc;
    },
    [...listOrder]
  );
};

export const getExistingDataList = <T>(docs: QueryDocumentSnapshot<DocumentData>[]): T[] => {
  return docs.reduce<T[]>((acc, doc) => {
    if (doc.exists) {
      acc.push(doc.data() as T);
    }
    return acc;
  }, []);
};

export const getValidOrderAndSortData = <T extends { id: string }>(
  docs: QueryDocumentSnapshot<DocumentData>[],
  order: string[]
): { order: string[]; dataList: T[] } => {
  const dataList = getExistingDataList<T>(docs);
  let validOrder = order;

  if (order.length !== dataList.length) {
    validOrder = getListOrderWithMissingIds(dataList, order);
  }

  return { order: validOrder, dataList: sortListByIds(validOrder, dataList) };
};

export const getFallbackAssets = <T extends { id: string }>(
  docs: QueryDocumentSnapshot<DocumentData>[]
): {
  fallbackAssetsList: T[];
  assetsWithoutFallbacks: QueryDocumentSnapshot<DocumentData>[];
} => {
  const fallbackAssetsList: T[] = [];
  const assetsWithoutFallbacks = docs.filter(doc => {
    if (!doc.exists) {
      return false;
    }

    const asset = doc.data();
    if (asset?.name === FALLBACK_CHARACTER_NAME) {
      fallbackAssetsList.push(asset as T);
      return false;
    }
    return true;
  });
  return { fallbackAssetsList, assetsWithoutFallbacks };
};

export const getFilePath = (filePath: string): string => {
  if (process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV === "test") {
    // The path of the files in local environment (firebase emulator) or local tests
    return path.resolve(`${process.cwd()}/../functions/${filePath}`);
  }

  // The path of the files in deployed firebase function
  return path.resolve(`/workspace/${filePath}`);
};
