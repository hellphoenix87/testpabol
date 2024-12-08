import admin from "firebase-admin";
import { UserRecord } from "firebase-admin/auth";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getLogMessage } from "../utils/utils";

const listAllUsers = async (): Promise<UserRecord[]> => {
  const listUsersResult = await admin.auth().listUsers(1000);

  if (listUsersResult.pageToken) {
    const users = await listAllUsers();
    return [...listUsersResult.users, ...users];
  }

  return listUsersResult.users;
};

const findAndDeleteTestUsers = async () => {
  const batch = admin.firestore().batch();
  const allUsers = await listAllUsers();
  const removedUsers = [];

  console.log(`${allUsers.length} users were found`);

  for (let index = 0; index < allUsers.length; index++) {
    const { email, uid } = allUsers[index];

    if (email?.includes("@e2e.test")) {
      console.log(getLogMessage(`Found test user with UID ${uid}`, { userUID: uid, userEmail: email }));

      batch.delete(admin.firestore().collection("users").doc(uid));
      batch.delete(admin.firestore().collection("creators").doc(uid));
      await admin
        .firestore()
        .collection("videos")
        .where("author", "==", uid)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
          });
        });

      console.log(
        getLogMessage(`Deleted test user and creator with UID ${uid} from users and creators collections`, {
          userUID: uid,
          userEmail: email,
        })
      );

      await admin.auth().deleteUser(uid);

      console.log(
        getLogMessage(`Deleting test user with UID ${uid} from Authentication`, { userUID: uid, userEmail: email })
      );

      removedUsers.push({ uid, email });
    }
  }

  await batch.commit();
  console.log(getLogMessage(`${removedUsers.length} test users were deleted`, { removedUsers }));
};

// Run once a day to clean up test users
// Manually run the task here https://console.cloud.google.com/cloudscheduler
export const cleanUpTestUsers = onSchedule("every day 00:00", async () => {
  console.log("Test user cleanup started");
  await findAndDeleteTestUsers();
  console.log("Test user cleanup finished");
});
