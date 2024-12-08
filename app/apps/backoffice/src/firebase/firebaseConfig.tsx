import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { connectFunctionsEmulator, getFunctions } from "@firebase/functions";

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
const app = initializeApp(firebaseConfig);
// exports
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
export const publicStorage = getStorage(app, process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE);

if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  // Only Functions are activated for Emulator.
  // Firestore, Auth, Storage are used with cloud Stage environment.
  connectFunctionsEmulator(functions, "localhost", 5001);
  console.log("Using local firebase Functions emulator");
} else {
  console.log("Using production firebase", location.hostname);
}

export default app;
