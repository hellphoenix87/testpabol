import { Storage } from "@google-cloud/storage";
import * as logger from "firebase-functions/logger";

interface CopyDirData {
  srcBucket: string;
  srcPath: string;
  destBucket: string;
  destPath: string;
}

const gcs = new Storage();

export const copyDir = async (data: CopyDirData) => {
  const { srcBucket, srcPath, destBucket, destPath } = data;
  try {
    // Get the source files references
    const [files] = await gcs.bucket(srcBucket).getFiles({ prefix: srcPath });

    await Promise.all(
      files.map(file => file.copy(gcs.bucket(destBucket).file(`${destPath}/${file.name.split("/").pop()}`)))
    );

    logger.log(`Files ${srcPath} copied to ${destPath}`);
  } catch (error) {
    logger.error(`Error copying files ${srcPath} to ${destPath}:`, error);
    throw new Error("Failed to copy file");
  }
};
