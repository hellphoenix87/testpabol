import { Storage } from "@google-cloud/storage";
import * as logger from "firebase-functions/logger";

interface CopyFileData {
  srcBucket: string;
  srcPath: string;
  destBucket: string;
  destPath: string;
}

const gcs = new Storage();

export const copyFile = async (data: CopyFileData) => {
  const { srcBucket, srcPath, destBucket, destPath } = data;

  // Get the source file reference
  const srcFile = gcs.bucket(srcBucket).file(srcPath);

  // Get the destination file reference
  const destFile = gcs.bucket(destBucket).file(destPath);

  try {
    await srcFile.copy(destFile);

    logger.log(`File ${srcPath} copied to ${destPath}`);
  } catch (error) {
    logger.error(`Error copying file ${srcPath} to ${destPath}:`, error);
    throw new Error("Failed to copy file");
  }
};
