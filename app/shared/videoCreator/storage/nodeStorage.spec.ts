import { DEFAULT_OPTIONS } from "../constants";
import { getMediaData } from "../prepareData";
import { fileDownload, mockedUpload, mockedFile, sceneMockFactory, fileExists, mockedStorage } from "../test-utils";

const mockLoadImage = jest.fn(() => "loaded image for canvas");
const mockGetDuration = jest.fn(() => 5);
const mockConvertVideoToImages = jest.fn(() => [Buffer.from("")]);
const mockPrepareDir = jest.fn(dir => `temp-path/${dir}`);
const mockGenerateTempFileUrl = jest.fn((name, dir) => `${dir}/${name}`);
jest.mock("canvas", () => ({ loadImage: mockLoadImage }));
jest.mock("../ffmpeg", () => ({
  getFileDurationWithRetry: mockGetDuration,
  convertVideoToImages: mockConvertVideoToImages,
}));
jest.mock("../utils/fileControl", () => ({
  prepareDirectory: mockPrepareDir,
  generateTempFileUrl: mockGenerateTempFileUrl,
}));

import { NodeStorageFactory } from "./nodeStorage";

describe("nodeStorage", () => {
  const storage = NodeStorageFactory.getInstance();
  const mediaData = getMediaData({ original: [sceneMockFactory()], targeted: [sceneMockFactory()] }, DEFAULT_OPTIONS);

  describe("downloadFiles", () => {
    it("should trigger the download for the targeted files", async () => {
      await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(mockedFile).toHaveBeenCalledWith("mock-image-url");
      expect(mockedFile).toHaveBeenCalledWith("mock-music-id");
      expect(mockedFile).toHaveBeenCalledWith("mock-sound-url");
      expect(mockedFile).toHaveBeenCalledWith("mock-video-url");
      expect(fileDownload).toBeCalled();
    });

    it("should load image for canvas", async () => {
      await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(mockLoadImage).toHaveBeenCalledWith("mock-file-url");
    });

    it("should load frame images got from the video", async () => {
      await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(mockConvertVideoToImages).toBeCalledWith(
        expect.objectContaining({
          video: "temp-dir/mock-bucket-name-mock-video-url",
          fps: 25,
        })
      );
      expect(mockLoadImage).toBeCalledWith(Buffer.from(""));
    });

    it("should call get duration for all audio files in the scene", async () => {
      await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(mockGetDuration).toBeCalledTimes(24);
    });

    it("should return the mapped shots", async () => {
      const res = await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(res[0].image).toEqual({
        filename: "mock-image-url",
        value: "loaded image for canvas",
      });
      expect(res[0].sound).toEqual(
        expect.objectContaining({
          duration: 5,
          filename: "mock-sound-url",
        })
      );
      expect(res[0].music).toEqual(
        expect.objectContaining({
          duration: 5,
          filename: "mock-music-id",
        })
      );
    });
  });
  describe("uploadFile", () => {
    it("should call storage upload method", async () => {
      mockedUpload.mockResolvedValue([{ publicUrl: () => "mock-url" }]);
      await storage.uploadFile("file location", "file-name");
      expect(mockedUpload).toHaveBeenCalledWith("file location", { destination: "file-name" });
    });
  });
  describe("checkFile", () => {
    it("should return null if file does not exist", async () => {
      fileExists.mockImplementationOnce(() => [false]);
      const res = await storage.checkFile("file-name");
      expect(res).toEqual(null);
    });
    it("should return the built url for the file in the bucket", async () => {
      fileExists.mockImplementationOnce(() => [true]);
      const res = await storage.checkFile("file-name");
      expect(res).toEqual("https://storage.googleapis.com/mock-bucket-name/file-name");
    });
  });
  describe("getFileURL", () => {
    it("should return the built url for the targeted file", () => {
      const bucket = mockedStorage.bucket("mock-bucket-name-2") as any;
      const res = storage.getFileURL(bucket, "file-name");
      expect(res).toEqual("https://storage.googleapis.com/mock-bucket-name-2/file-name");
    });
  });
});
