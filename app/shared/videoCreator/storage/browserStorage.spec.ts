import { DEFAULT_OPTIONS } from "../constants";
import { getMediaData } from "../prepareData";
import { mockedGetDownloadURL, mockedGetBytes, sceneMockFactory, MockImageClass } from "../test-utils";
import { BrowserStorageFactory } from "./browserStorage";
import { AudioContext as context } from "standardized-audio-context-mock";
global.AudioContext = context as any;
global.Image = MockImageClass as any;

describe("browserStorage", () => {
  const fireStoreMock = {} as any;
  const storage = BrowserStorageFactory.getInstance(fireStoreMock);
  const mediaData = getMediaData({ original: [sceneMockFactory()], targeted: [sceneMockFactory()] }, DEFAULT_OPTIONS);
  describe("downloadFiles", () => {
    it("should trigger the download for the targeted files", async () => {
      await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(mockedGetDownloadURL).toHaveBeenCalledTimes(2); // 2 images
      expect(mockedGetBytes).toHaveBeenCalledTimes(6); // 6 audio files
    });

    it("should return the mapped shots", async () => {
      const res = await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(res[0].image).toEqual(
        expect.objectContaining({
          cacheKey: "mocked-bucket-name_mock-image-url",
          filename: "mock-image-url",
        })
      );
      expect(res[0].sound).toEqual(
        expect.objectContaining({
          cacheKey: "mocked-bucket-name_mock-sound-url",
          filename: "mock-sound-url",
        })
      );
      expect(res[0].music).toEqual(
        expect.objectContaining({
          cacheKey: "mocked-bucket-name_mock-music-id",
          filename: "mock-music-id",
        })
      );
    });

    it("should return correct url as the source in the image", async () => {
      mockedGetDownloadURL.mockResolvedValue("mocked-image-url");
      const res = await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(res[0].image.value.src).toEqual("mocked-image-url");
    });

    it("should return correct audio file data", async () => {
      jest.spyOn(context.prototype, "decodeAudioData").mockResolvedValue("decoded-audio-mock" as any);
      const mockBuffer = Buffer.from("");
      mockedGetBytes.mockResolvedValue(mockBuffer);
      const res = await storage.downloadFiles(mediaData, DEFAULT_OPTIONS);
      expect(res[0].music.value).toEqual("decoded-audio-mock");
    });
  });
});
