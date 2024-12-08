import { SignedURLData, generateFileSignURL, isFileExists } from "./storage";

const generatePublicURL = (filename: string) => {
  return `https://${process.env.PABOLO_BUCKET_PUBLIC_CDN}/${encodeURIComponent(filename)}`;
};

export const generateSignedURL = async (bucket: string, filePath: string): Promise<SignedURLData> => {
  if (bucket === process.env.PABOLO_BUCKET_PUBLIC_CDN) {
    return {
      fileName: filePath.split("/").pop() || "",
      filePath,
      url: generatePublicURL(filePath),
    };
  }

  const isExists = await isFileExists(bucket, filePath);

  if (!isExists) {
    throw new Error(`File ${filePath} does not exist in bucket ${bucket}`);
  }
  return generateFileSignURL(bucket, filePath);
};
