import { storage } from "./firebase/firebaseConfig";
import { ref, getDownloadURL } from "firebase/storage";

// Get download URL for file
export async function getDownloadUrlForFile(filename) {
  const fileRef = ref(storage, filename);
  return await getDownloadURL(fileRef);
}

// Get download URL for public files
export function getDownloadUrlForPublic(filename) {
  return `https://${process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE}/${encodeURIComponent(filename)}`;
}

// Get download URL for profile image if it is stored in Firebase Storage
// Otherwise, return the URL as is
export async function getProfileImageDownloadUrl(uid: string, imageUrl: string) {
  // If imageUrl is a download url, return it as is
  if (imageUrl && imageUrl.includes("https://firebasestorage.googleapis.com")) {
    console.log("returning as is");
    return imageUrl;
  }
  // If imageUrl is a path to user storage
  if (imageUrl && imageUrl.includes(uid)) {
    return await getDownloadUrlForFile(imageUrl);
  }
  // If imageUrl is a path to public avatars storage
  if (imageUrl && imageUrl.includes("avatars")) {
    return getDownloadUrlForPublic(imageUrl);
  }
  return imageUrl;
}
