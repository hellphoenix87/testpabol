import { expect } from "@playwright/experimental-ct-react";
import { Page } from "playwright-core";
import fs from "fs";
import admin from "firebase-admin";
import { doc, onSnapshot } from "firebase/firestore";

import { db } from "../../src/firebase/firebaseConfig";

import FirebaseAuth from "../../src/firebase/auth";
import User from "@app/interfaces/User";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS!, "utf8")) as admin.ServiceAccount
  ),
});

export const generateRandomEmail = (length = 3) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  const email = `${process.env.__COMMIT_HASH__!}-${randomString}@e2e.test`;

  console.log("\nGenerated random email:", email);

  return email;
};

// Wait for user document to be created in firestore, and update it with data
export const updateUserData = async (userUID: string, data: any): Promise<User> => {
  return new Promise<User>(resolve => {
    // Listen for user document to be created
    const unsubscribe = onSnapshot(doc(db, "users", userUID), async doc => {
      if (!doc.exists()) {
        return null;
      }

      const docData = doc.data() as User;
      if (!docData) {
        return null;
      }
      // Update user document with data
      await admin
        .firestore()
        .collection("users")
        .doc(userUID)
        .set(
          {
            display_name: "Pabolo E2E Test",
            is_creator: data?.isCreator || false,
            is_welcomed: data?.isWelcomed || false,
          },
          { merge: true }
        );

      // Set email verified to true for test user
      await admin.auth().updateUser(userUID, {
        emailVerified: true,
      });

      // Check if user document has been updated with required data
      if (docData.is_creator === data?.isCreator && docData.is_welcomed === data?.isWelcomed) {
        // Unsubscribe from the listener and resolve the promise when user document has been updated with required data
        unsubscribe();
        resolve(docData);
      }
    });
  });
};

export const createTestUser = async (email: string, password: string, isCreator = false, isWelcomed = false) => {
  console.log("\nCreating test user:\n\temail:", email, "\n\tpassword:", password);

  const result = await FirebaseAuth.createUserWithEmailAndPassword(email, password);

  const userUID = result.user.uid;

  const updatedUserData = await updateUserData(userUID, { email, isCreator, isWelcomed });

  console.log("\nUpdated test user data:\n\t", updatedUserData);

  console.log("\nCreated test user:\n\tUID:", userUID);

  return userUID;
};

export const removeTestUser = async (userUID: string) => {
  console.log("\nRemoving test user:\n\tUID:", userUID);

  await admin.firestore().collection("users").doc(userUID).delete();
  await admin.firestore().collection("creators").doc(userUID).delete();
  await admin
    .firestore()
    .collection("videos")
    .where("author", "==", userUID)
    .get()
    .then(querySnapshot => {
      querySnapshot.forEach(doc => {
        void doc.ref.delete();
      });
    });

  console.log("\nRemoved test user from firestore:\n\tUID:", userUID);

  await admin.auth().deleteUser(userUID);

  console.log("\nRemoved test user with UID", userUID);
};

const assertResponse = (method: string, requestStatus: number) => {
  const statusRange = requestStatus >= 200 && requestStatus <= 310;
  console.log(`Response from ${method} match: ${requestStatus} status.`);
  if (!statusRange) {
    console.error(`FAILED API CALL: Response from ${method} match: ${requestStatus} status.`);
  }
  expect(statusRange).toBeTruthy();
};

export const waitForResponseFromServer = async <T = any>(page: Page, method: firebaseMethods): Promise<T> => {
  const response = await page.waitForResponse(res => {
    const requestData = res.request().postDataJSON();
    const requestStatus = res.status();

    assertResponse(method, requestStatus);

    console.log(`Waiting for ${method} match: ${requestStatus} status.\nRequest data:`, requestData);
    return res.url().includes(method) && requestStatus === 200;
  });

  return (await response.json()) as T;
};

export enum LoggerPage {
  HOME = " [Home]",
  CREATION_LIST = " [Creation List]",
  NEW_CREATION = " [New Creation]",
  ATTRIBUTES = " [Attributes]",
  TITLE_PLOT = " [Title & Plot]",
  ASSETS = " [Assets]",
  FINISH = " [Finish]",
  VIDEO_PLAYER = " [Video Player]",
  NONE = "",
}

export const e2eLogger = (message: string, loggerPage: LoggerPage = LoggerPage.NONE): void => {
  console.log(`-[Test Case]${loggerPage} : `, message);
};

export const calculateElapsedTime = (startTime: number) => {
  const timeDiff = Date.now() - startTime;
  const seconds = Math.floor(timeDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  return `${hours}:${minutes}:${seconds}s`;
};
