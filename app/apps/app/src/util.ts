import { ref, uploadBytes, getDownloadURL, FirebaseStorage } from "firebase/storage";

import { storage } from "./firebase/firebaseConfig";
import { ImageState } from "./constants/ImageState";

export async function uploadImage(
  uid: string,
  fieldName: string,
  file: File,
  onUpload: ((metadata: any) => void) | null = null
): Promise<string> {
  const filename = `${uid}/images/${fieldName}.jpg`;
  const imgRef = ref(storage, filename);
  const metadata = await uploadBytes(imgRef, file);
  if (onUpload) {
    onUpload(metadata);
  }
  return filename;
}

// Boolean if the download is complete.
export const completedDownloads: { [key: string]: AudioBuffer | HTMLImageElement } = {};

async function getFirebaseUrl(storageRef: FirebaseStorage, filename: string): Promise<string> {
  if (!filename || checkImageLoading(filename)) {
    return filename;
  }
  return getDownloadURL(ref(storageRef, filename));
}

export async function getDownloadUrlForFile(filename: string): Promise<string> {
  return await getFirebaseUrl(storage, filename);
}

export function getDownloadUrlForPublic(filename: string): string {
  return `https://${process.env.PABOLO_BUCKET_PUBLIC_CDN}/${encodeURIComponent(filename)}`;
}

// Get download URL for profile image if it is stored in Firebase Storage
// Otherwise, return the URL as is
export async function getProfileImageDownloadUrl(uid: string, imageUrl: string): Promise<string> {
  // If imageUrl is a download url, return it as is
  if (imageUrl && imageUrl.includes("https://firebasestorage.googleapis.com")) {
    return imageUrl;
  }
  // If imageUrl is a path to user storage
  if (imageUrl && imageUrl.includes(uid)) {
    return await getDownloadUrlForFile(imageUrl);
  }
  // If imageUrl is a path to public avatars storage
  if (imageUrl && imageUrl.startsWith("avatars")) {
    return getDownloadUrlForPublic(imageUrl);
  }
  return imageUrl;
}

// Test if two objects are equals based on their keys and values
// Returns true if the two objects have the same keys and values, false otherwise
export function isEqual(obj1: any, obj2: any): boolean {
  // Handle null values
  if (obj1 === null && obj2 === null) {
    return true;
  }
  if (obj1 === null || obj2 === null) {
    return false;
  }

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // If the objects have a different number of keys, they are not equal
  if (obj1Keys.length !== obj2Keys.length) {
    return false;
  }

  for (const key of obj1Keys) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    // If the value is another object, recursively compare it
    if (typeof val1 === "object" && typeof val2 === "object") {
      if (!isEqual(val1, val2)) {
        return false;
      }
    } else if (val1 !== val2) {
      // If the value is not an object and doesn't match, the objects are not equal
      return false;
    }
  }

  // If all keys and values match, the objects are equal
  return true;
}

export function checkImageLoading(image: string): boolean {
  return image === ImageState.LOADING.toString();
}
