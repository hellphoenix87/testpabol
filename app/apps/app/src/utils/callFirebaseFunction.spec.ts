import { describe, it, vi, Mock } from "vitest";
import callFirebaseFunction, { prependRev, logClientError, firebaseMethods } from "./callFirebaseFunction";
import { httpsCallable } from "firebase/functions";

vi.mock("firebase/auth");
vi.mock("firebase/functions");
vi.mock("./logger");
vi.mock("../firebase/firebaseConfig");

vi.mock("./callFirebaseFunction", async () => {
  const actual = await vi.importActual("./callFirebaseFunction");
  return {
    ...(actual as object),
    logClientError: vi.fn(),
  };
});

describe("callFirebaseFunction functions", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("prependRev", () => {
    it("should prepend 'R' and commit hash to the given function name", () => {
      process.env.__COMMIT_HASH__ = "abcd1234";
      const functionName = "saveScenes";
      const result = prependRev(functionName);
      expect(result).toBe("Rabcd1234_saveScenes");
    });
  });

  describe("callFirebaseFunction", () => {
    it("should call the Firebase function with the correct parameters", async () => {
      const functionName = firebaseMethods.GET_CREATION_TITLE_PLOT_META;
      const params = {
        creationId: "1234",
      };

      const mockResponse = {
        title: "Test title",
      };
      const mockHttpsCallable = vi.fn().mockResolvedValue(mockResponse);

      (httpsCallable as Mock).mockImplementationOnce(vi.fn().mockReturnValue(mockHttpsCallable));

      // Call the function
      const response = await callFirebaseFunction(functionName, params);

      expect(response).toEqual(mockResponse);
      expect(httpsCallable).toHaveBeenCalled();
      expect(mockHttpsCallable).toHaveBeenCalledWith(expect.objectContaining(params));
      expect(logClientError).not.toHaveBeenCalled();
    });

    it("should call logClientError when the call fails", async () => {
      const functionName = firebaseMethods.GET_CREATION_TITLE_PLOT_META;
      const params = {
        creationId: "1234",
      };

      const mockError = {
        message: "Dummy error message",
      };

      const mockRejectedHttpsCallable = vi.fn().mockRejectedValue(mockError);
      const mockResolvedHttpsCallable = vi.fn().mockResolvedValue({});

      (httpsCallable as Mock)
        .mockReturnValueOnce(mockRejectedHttpsCallable)
        .mockReturnValue(mockResolvedHttpsCallable);

      try {
        await callFirebaseFunction(functionName, params);
        expect(httpsCallable).toHaveBeenCalledTimes(2);
        expect(logClientError).toHaveBeenCalledTimes(1);
      } catch (e) {
        expect(e).toEqual(mockError);
      }
    });
  });
});
