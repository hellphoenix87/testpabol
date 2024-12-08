import {
  mockedStorage,
  mockedFile,
  fileDownload,
  fileSave,
  fileExists,
} from "../../../shared/videoCreator/test-utils/storage.mock";

jest.mock("@google-cloud/storage", () => ({
  Storage: jest.fn(() => mockedStorage),
}));

import * as storage from "./storage";

describe("storage utils", () => {
  describe("getDirectoryFilenames", () => {
    it("should return the file names in the directory", async () => {
      const res = await storage.getDirectoryFilenames("mock-bucket", "mock-directory");
      expect(res).toEqual(["mock-file-1", "mock-file-2"]);
    });
  });
  describe("isFileExists", () => {
    it("should return false if file not exists", async () => {
      fileExists.mockImplementationOnce(() => [true]);
      const res = await storage.isFileExists("mock-bucket", "mock-file");
      expect(mockedFile).toHaveBeenCalledWith("mock-file");
      expect(res).toEqual(true);
    });

    it("should return true if file not exists", async () => {
      fileExists.mockImplementationOnce(() => [false]);
      const res = await storage.isFileExists("mock-bucket", "mock-file");
      expect(mockedFile).toHaveBeenCalledWith("mock-file");
      expect(res).toEqual(false);
    });
  });
  describe("getFileBuff", () => {
    it("should return the resolved buffer from the storage download method", async () => {
      fileDownload.mockImplementationOnce(() => ["mock-buffer"]);
      const res = await storage.getFileBuff("mock-bucket", "mock-file");
      expect(res).toEqual("mock-buffer");
    });
  });
  describe("saveFileBuffer", () => {
    it("should should call file save with the passed buffer", async () => {
      await storage.saveFileBuffer("mock-bucket", "mock-file", Buffer.from("mocked-buffer"));
      expect(fileSave).toHaveBeenCalledWith(Buffer.from("mocked-buffer"));
    });
  });
  describe("isFileExists", () => {
    it("should check if the file exist or not", async () => {
      await storage.isFileExists("mock-bucket", "mock-file");
      expect(fileExists).toBeCalledWith();
    });
  });
});
