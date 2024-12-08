import { firestoreAdmin } from "../test-utils/firebase-mock";
import {
  getUserListCollection,
  getUserListSnapshot,
  getUserDoc,
  getUserSnapshot,
  getUserData,
  setUserData,
  deleteUser,
} from "./usersCollection";
import { Collections } from "../constants/collections";
import { deleteCreator } from "./creatorsCollection";

jest.mock("firebase-admin", () => firestoreAdmin);
jest.mock("./creatorsCollection");

describe("Firebase Functions", () => {
  describe("getUserListCollection", () => {
    it("should return a CollectionReference", () => {
      getUserListCollection();
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
    });
  });

  describe("getUserListSnapshot", () => {
    it("should return a snapshot", async () => {
      await getUserListSnapshot();
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
    });
  });

  describe("getUserDoc", () => {
    it("should return a DocumentReference", () => {
      const userId = "testUserId";
      getUserDoc(userId);
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
      expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(userId);
    });
  });

  describe("getUserSnapshot", () => {
    it("should return a DocumentSnapshot", async () => {
      const userId = "testUserId";
      await getUserSnapshot(userId);
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
      expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(userId);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
    });
  });

  describe("getUserData", () => {
    it("should return a User object", async () => {
      const userId = "testUserId";
      const userData = { id: userId, display_name: "John Doe", email: "john.doe@gmail.com" };

      firestoreAdmin.dataSpy.mockReturnValueOnce(userData);

      const result = await getUserData(userId);
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
      expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(userId);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
      expect(firestoreAdmin.dataSpy).toHaveBeenCalled();
      expect(result).toEqual(userData);
    });
  });

  describe("setUserData", () => {
    it("should call set with right params", async () => {
      const userId = "testUserId";
      const userData = { id: userId, display_name: "John Doe", email: "john.doe@gmail.com" };

      await setUserData(userId, userData);
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(userId);
      expect(firestoreAdmin.setSpy).toHaveBeenCalledWith(expect.objectContaining(userData), { merge: true });
    });
  });

  describe("deleteUser", () => {
    it("should delete user data and creator", async () => {
      const userId = "testUserId";
      await deleteUser(userId);
      expect(deleteCreator).toHaveBeenCalledWith(userId);
      expect(firestoreAdmin.collectionSpy).toHaveBeenCalledWith(Collections.USERS);
      expect(firestoreAdmin.getSpy).toHaveBeenCalled();
      expect(firestoreAdmin.docSpy).toHaveBeenCalledWith(userId);
      expect(firestoreAdmin.deleteSpy).toHaveBeenCalled();
    });
  });
});
