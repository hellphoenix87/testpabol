import { generateSignedURL } from "./generateURL";
import { generateFileSignURL, isFileExists } from "./storage";

jest.mock("./storage");

describe("generateURL", () => {
  const mockedGenerateFileSignURL = generateFileSignURL as jest.Mock;
  const mockedIsFileExists = isFileExists as jest.Mock;

  describe("generateSignedURL", () => {
    beforeAll(() => {
      process.env.PABOLO_BUCKET_PUBLIC_CDN = "mock-public-bucket";
    });
    it("should return the public URL if the targeted bucket is the public bucket", async () => {
      const res = await generateSignedURL(process.env.PABOLO_BUCKET_PUBLIC_CDN as string, "mock-file");
      expect(res).toEqual({
        fileName: "mock-file",
        filePath: "mock-file",
        url: `https://${process.env.PABOLO_BUCKET_PUBLIC_CDN}/mock-file`,
      });
    });

    it("should throw error if the file does not exist in the bucket", async () => {
      mockedIsFileExists.mockImplementationOnce(() => false);
      await expect(generateSignedURL("mock-bucket", "mock-file")).rejects.toThrow(
        "File mock-file does not exist in bucket mock-bucket"
      );
    });

    it("should return the signed url data", async () => {
      mockedIsFileExists.mockImplementationOnce(() => true);
      mockedGenerateFileSignURL.mockImplementationOnce(() => ({ url: "mock-signed-url" }));
      const res = await generateSignedURL("mock-bucket", "mock-file");
      expect(res).toEqual({ url: "mock-signed-url" });
    });
  });
});
