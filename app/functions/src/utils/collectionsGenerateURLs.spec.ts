import { generateVideoUrls } from "./collectionsGenerateURLs";
import { generateSignedURL } from "./generateURL";

jest.mock("./generateURL");

const mockedGenerateSignedURL = generateSignedURL as jest.Mock;

describe("collectionsGenerateURLs", () => {
  beforeAll(() => {
    process.env.PABOLO_BUCKET_PUBLIC_CDN = "mock-public-bucket";
    process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE = "mock-media-bucket";
    process.env.PABOLO_BUCKET_NAME_ASSET_STORAGE = "mock-asset-bucket";
    process.env.PABOLO_BUCKET_NAME_VOICE_STORAGE = "mock-voice-bucket";
    process.env.PABOLO_BUCKET_NAME_SOUND_STORAGE = "mock-sound-bucket";
    process.env.PABOLO_BUCKET_NAME_MUSIC_STORAGE = "mock-music-bucket";
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe("generateVideoUrls", () => {
    it("should sign url in the public bucket if the video file is accepted", async () => {
      mockedGenerateSignedURL.mockResolvedValue({ url: "mock-signed-url" });
      const res = await generateVideoUrls({
        accepted: true,
        url: "mock-url",
        thumbnail_images_url: ["mock-thumbnail-url"],
      });
      expect(res.url).toEqual("mock-signed-url");
      expect(res.thumbnail_images_url).toEqual(["mock-signed-url"]);
      expect(mockedGenerateSignedURL).toHaveBeenCalledWith("mock-public-bucket", "mock-url");
      expect(mockedGenerateSignedURL).toHaveBeenCalledWith("mock-public-bucket", "mock-thumbnail-url");
    });

    it("should sign url in the media bucket if the mp4 video file not accepted", async () => {
      mockedGenerateSignedURL.mockResolvedValue({ url: "mock-signed-url" });
      const res = await generateVideoUrls({
        accepted: false,
        url: "mock-url.mp4",
        thumbnail_images_url: ["mock-thumbnail-url"],
      });
      expect(res.url).toEqual("mock-signed-url");
      expect(res.thumbnail_images_url).toEqual(["mock-signed-url"]);
      expect(mockedGenerateSignedURL).toHaveBeenCalledWith("mock-media-bucket", "mock-url.mp4");
      expect(mockedGenerateSignedURL).toHaveBeenCalledWith("mock-media-bucket", "mock-thumbnail-url");
    });

    it("should sign the url if the file not accepted and is stream url", async () => {
      mockedGenerateSignedURL.mockResolvedValue({ url: "mock-signed-url" });
      const res = await generateVideoUrls({
        accepted: false,
        url: "mock-stream-url",
        thumbnail_images_url: ["mock-thumbnail-url"],
      });
      expect(res.url).toEqual("mock-stream-url");
      expect(res.thumbnail_images_url).toEqual(["mock-signed-url"]);
      expect(mockedGenerateSignedURL).not.toHaveBeenCalledWith("mock-media-bucket", "mock-stream-url");
    });
  });
});
