import { Storage } from "@google-cloud/storage";
import { DAY } from "../constants/functionsConfig";

const storage = new Storage();

export interface SignedURLData {
  fileName: string;
  filePath: string;
  url: string;
}

export const getDirectoryFilenames = async (bucket: string, directory: string): Promise<string[]> => {
  const [fileNameArr] = await storage.bucket(bucket).getFiles({ prefix: directory });
  return fileNameArr.map(file => file.name.split("/").pop() || "");
};

export const generateDirectorySignURLs = async (
  bucket: string,
  options?: { expires?: number; directory?: string }
): Promise<SignedURLData[]> => {
  const fileNameArr = await getDirectoryFilenames(bucket, options?.directory || "");
  return await Promise.all(fileNameArr.map(file => generateFileSignURL(bucket, file, options)));
};

export const generateFileSignURL = async (
  bucket: string,
  fileName: string,
  options?: { expires?: number; directory?: string }
): Promise<SignedURLData> => {
  const filePath = options?.directory ? `${options.directory}/${fileName}` : fileName;
  const [url] = await storage
    .bucket(bucket)
    .file(filePath)
    .getSignedUrl({
      responseDisposition: "attachment",
      version: "v4",
      action: "read",
      expires: Date.now() + (options?.expires || DAY) * 1000,
    });
  return {
    fileName,
    filePath,
    url: [url]?.[0],
  };
};

export const isFileExists = async (bucket: string, fileName: string): Promise<boolean> => {
  const [exists] = await storage.bucket(bucket).file(fileName).exists();
  return exists;
};

export const getFileBuff = async (bucket: string, fileName: string): Promise<Buffer> => {
  const [data] = await storage.bucket(bucket).file(fileName).download();
  return data;
};

export const saveFileBuffer = async (bucket: string, fileName: string, buff: Buffer): Promise<void> => {
  await storage.bucket(bucket).file(fileName).save(buff);
};

export const downloadFileFromBucket = async (params: {
  bucketName: string;
  fileName: string;
  destination: string;
}): Promise<void> => {
  const storage = new Storage();
  const bucket = storage.bucket(params.bucketName);

  await bucket.file(params.fileName).download({ destination: params.destination });
};

export const uploadFileToBucket = async (params: {
  bucketName: string;
  localFilePath: string;
  destination: string;
}): Promise<void> => {
  const storage = new Storage();
  const bucket = storage.bucket(params.bucketName);

  await bucket.upload(params.localFilePath, { destination: params.destination });
};
