import { firestoreAdmin } from "../test-utils/firebase-mock";
import { getUidFromContext } from "./auth";

jest.mock("firebase-admin", () => firestoreAdmin);

describe("auth.ts", () => {
  describe("getUidFromContext", () => {
    it("should return the UID when it exists in the context", () => {
      const context = {
        auth: {
          uid: "user123",
        },
      };

      const result = getUidFromContext(context);

      expect(result).toBe("user123");
    });

    it("should throw an error if auth is not provided in the context", () => {
      const context = {};

      expect(() => {
        getUidFromContext(context);
      }).toThrow("Unauthenticated");
    });

    it("should throw an error if UID is not provided in the auth context", () => {
      const context = {
        auth: {},
      };

      expect(() => {
        getUidFromContext(context);
      }).toThrow("Invalid UID");
    });

    it("should throw an error if auth and UID are not provided in the context", () => {
      const context = {};

      expect(() => {
        getUidFromContext(context);
      }).toThrow("Unauthenticated");
    });
  });
});
