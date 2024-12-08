import { findElementBinary, getRandomValueFromList, getRandomId, getRandomAvatarImage, sortListByIds } from "./utils";
import { DocumentSnapshot, DocumentData } from "firebase-admin/firestore";

// Mocks
jest.mock("firebase-admin", () => {
  return {
    initializeApp: jest.fn(),
    instanceId: jest.fn().mockReturnValue({ app: { options: { projectId: "test-project" } } }),
  };
});

jest.mock("@google-cloud/storage", () => {
  class MockStorage {
    bucket() {
      // Mock implementation of the bucket method
      return {
        getFiles: jest
          .fn()
          .mockReturnValue([[{ name: "avatars/1.png" }, { name: "avatars/2.png" }, { name: "avatars/3.png" }], null]),
      };
    }
  }
  return { Storage: MockStorage };
});

const mockSnapshot = (data: any) => ({
  data: () => data,
});

describe("utils test", () => {
  describe("findElementBinary", () => {
    it("should find element in the array", () => {
      const arr = [mockSnapshot({ id: 1 }), mockSnapshot({ id: 2 }), mockSnapshot({ id: 3 })];
      let result = findElementBinary(arr as DocumentSnapshot<DocumentData>[], 2, "id");
      expect(result).toEqual({ id: 2 });

      result = findElementBinary(arr as DocumentSnapshot<DocumentData>[], 3, "id");
      expect(result).toEqual({ id: 3 });
    });

    it("should return null if element not found", () => {
      const arr = [mockSnapshot({ id: 1 }), mockSnapshot({ id: 2 }), mockSnapshot({ id: 3 })];
      const result = findElementBinary(arr as DocumentSnapshot<DocumentData>[], 4, "id");
      expect(result).toBeNull();
    });
  });

  describe("getRandomValueFromList", () => {
    it("return a random value from the list", () => {
      const list = [1, 2, 3, 4, 5];
      const result = getRandomValueFromList(list);
      expect(list).toContain(result);
    });
  });

  describe("getRandomId", () => {
    it("return 8 character alphanumeric random string", () => {
      const result = getRandomId();
      expect(result).toMatch(/^[a-z0-9]{8}$/);
    });
  });

  describe("prependRev", () => {
    it("return 8 character alphanumeric random string", () => {
      const result = getRandomId();
      expect(result).toMatch(/^[a-z0-9]{8}$/);
    });
  });

  describe("getRandomAvatarImage", () => {
    it("return random image url", async () => {
      const result = await getRandomAvatarImage();
      expect(result).toMatch(/^avatars\/[0-9]{1}.png$/);
    });
  });

  describe("sortListByIds", () => {
    it("should return list, sorted by ids", () => {
      const list = [
        { id: "1", name: "name1" },
        { id: "10", name: "name10" },
        { id: "4", name: "name4" },
        { id: "2", name: "name2" },
        { id: "9", name: "name9" },
        { id: "5", name: "name5" },
        { id: "8", name: "name8" },
        { id: "6", name: "name6" },
        { id: "3", name: "name3" },
        { id: "7", name: "name7" },
      ];
      const ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      const result = sortListByIds(ids, list);

      expect(result).not.toEqual(list);
      expect(result).toEqual([
        { id: "1", name: "name1" },
        { id: "2", name: "name2" },
        { id: "3", name: "name3" },
        { id: "4", name: "name4" },
        { id: "5", name: "name5" },
        { id: "6", name: "name6" },
        { id: "7", name: "name7" },
        { id: "8", name: "name8" },
        { id: "9", name: "name9" },
        { id: "10", name: "name10" },
      ]);
    });

    it("should not mutate original list", () => {
      const list = [
        { id: "1", name: "name1" },
        { id: "10", name: "name10" },
        { id: "4", name: "name4" },
        { id: "2", name: "name2" },
        { id: "9", name: "name9" },
        { id: "5", name: "name5" },
        { id: "8", name: "name8" },
        { id: "6", name: "name6" },
        { id: "3", name: "name3" },
        { id: "7", name: "name7" },
      ];
      const ids = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      sortListByIds(ids, list);

      expect(list).toEqual(list);
    });

    it("should return initial list, if the list of ids is empty", () => {
      const list = [
        { id: "1", name: "name1" },
        { id: "10", name: "name10" },
        { id: "4", name: "name4" },
        { id: "2", name: "name2" },
        { id: "9", name: "name9" },
        { id: "5", name: "name5" },
        { id: "8", name: "name8" },
        { id: "6", name: "name6" },
        { id: "3", name: "name3" },
        { id: "7", name: "name7" },
      ];
      const result = sortListByIds([], list);

      expect(result).toEqual(list);
    });
  });
});
