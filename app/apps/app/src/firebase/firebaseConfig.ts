import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";
import { logger } from "../utils/logger";

// firebase config
const firebaseConfig = {
  apiKey: process.env.PABOLO_APP_API_KEY,
  authDomain: process.env.PABOLO_APP_AUTH_DOMAIN,
  projectId: process.env.PABOLO_PROJECT_ID,
  storageBucket: process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE,
  messagingSenderId: process.env.PABOLO_APP_MESSAGING_SENDER_ID,
  appId: process.env.PABOLO_APP_ID,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
// exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Storage buckets
export const storage = getStorage(app);
export const musicStorage = getStorage(app, process.env.PABOLO_BUCKET_NAME_MUSIC_STORAGE);
export const publicStorage = getStorage(app, process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE);
export const voiceStorage = getStorage(app, process.env.PABOLO_BUCKET_NAME_VOICE_STORAGE);
export const soundStorage = getStorage(app, process.env.PABOLO_BUCKET_NAME_SOUND_STORAGE);

export const isConnectedToFunctionsEmulator = () => {
  return typeof location === "undefined" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
};

if (isConnectedToFunctionsEmulator()) {
  // Only Functions are activated for Emulator.
  // Firestore, Auth, Storage are used with cloud Stage environment.
  connectFunctionsEmulator(functions, "localhost", 5001);
  logger.log("Using local firebase Functions emulator");
} else {
  logger.log("Using production firebase", location.hostname);
}

export default app;
