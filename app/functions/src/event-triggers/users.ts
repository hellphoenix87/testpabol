import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { sendEmail, AttachmentsFiles, EmailTemplates } from "../utils/email";
import { getTimestamp } from "../utils/time";
import { getRandomAvatarImage } from "../utils/utils";

import * as usersCollection from "../DB/usersCollection";
import { deleteCreator, setCreatorData } from "../DB/creatorsCollection";

export const addUser = functions.auth.user().onCreate(async user => {
  await usersCollection.setUserData(user.uid, {
    email: user.email,
    uid: user.uid,
    display_name: "",
    twitter: "",
    instagram: "",
    web: "",
    // If the user has a photo (from google) use it, otherwise assign a random avatar image
    avatar_url: user?.photoURL || (await getRandomAvatarImage()),
    header_url: "",
    about: "",
    location: "",
    // The user does not have access to creator by default, it can be changed from the backoffice
    is_creator: false,
    is_welcomed: false,
    current_creation: 0, // The id of the current creation the user is working on
    newsletter: true, // Does the user want to receive the newsletter
    created_at: getTimestamp(),
  });

  await setCreatorData(user.uid, { currentcreation: 0 });
});

// Send a welcome email to the user when display_name is updated from an empty string to a non empty string
export const sendWelcomeEmail = functions.firestore.document("users/{uid}").onUpdate(async change => {
  // the new value after this update
  const newValue = change.after.data() || {};

  // the previous value before this update
  const previousValue = change.before.data() || {};

  // Prevent sending welcome emails to E2E test users
  if (newValue?.email?.endsWith("@e2e.test")) {
    return;
  }

  // If the field is_welcomed was changed from false to true
  if (newValue.is_welcomed && !previousValue.is_welcomed) {
    await sendEmail({
      template: EmailTemplates.WELCOME_EMAIL,
      receiverUid: newValue.uid,
      subject: "Welcome to pabolo!",
      variables: {
        displayName: newValue.display_name,
      },
      attachments: [AttachmentsFiles.TERMS_OF_USE],
    });
  }
});

// This function is called whenever a user is deleted and deletes the user document from the users collection.
export const deleteUser = functions.auth.user().onDelete(async user => {
  await deleteCreator(user.uid);
  await usersCollection.deleteUser(user.uid);

  // Delete all files in storage uid
  const bucket = admin.storage().bucket();
  const files = await bucket.getFiles({
    prefix: user.uid,
  });

  files[0].forEach(async file => {
    await file.delete();
  });
});
