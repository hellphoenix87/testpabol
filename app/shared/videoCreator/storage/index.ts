import { FetchedShot, InternalOptions, MediaData, StreamInfo } from "../interfaces";
import { BrowserStorage } from "./browserStorage";
import { NodeStorage } from "./nodeStorage";

let StorageFactory: any;
if (typeof window === "undefined")
  import("./nodeStorage").then(({ NodeStorageFactory }) => {
    StorageFactory = NodeStorageFactory;
  });
else
  import("./browserStorage").then(({ BrowserStorageFactory }) => {
    StorageFactory = BrowserStorageFactory;
  });

// download the files (images and audio files)
export const downloadMediaFiles = async (mediaData: MediaData[], options: InternalOptions): Promise<FetchedShot[]> => {
  if (options.env === "browser") {
    if (!options.firebaseApp) throw new Error("Browser environment must provide the firebaseApp");
    const browserStorage: BrowserStorage = StorageFactory.getInstance(options.firebaseApp);
    return await browserStorage.downloadFiles(mediaData, options);
  }
  const nodeStorage: NodeStorage = StorageFactory.getInstance();
  return await nodeStorage.downloadFiles(mediaData, options);
};

// upload the video file to the gcp bucket
export const uploadVideoFile = async (file: string, pathOptions: { cid: string; uid: string; part?: number }) => {
  if (typeof window !== "undefined") return null;
  const nodeStorage = StorageFactory.getInstance();
  return await nodeStorage.uploadFile(file, getFilePath(pathOptions.cid, pathOptions.uid, pathOptions.part));
};

// upload the stream file to the gcp bucket
export const uploadStream = async (streamInfo: StreamInfo, pathOptions: { cid: string; uid: string }) => {
  if (typeof window !== "undefined") return null;
  const nodeStorage = StorageFactory.getInstance();
  return await nodeStorage.uploadDir(streamInfo.directory, `${pathOptions.uid}/${pathOptions.cid}/stream`);
};

// check if the video file already created, used by backend only
export const checkVideoFile = async (cid: string, uid: string, part?: number): Promise<string | null> => {
  if (typeof window !== "undefined") return null;
  const nodeStorage = StorageFactory.getInstance();
  return await nodeStorage.checkFile(getFilePath(cid, uid, part));
};

export const getVideoParts = async (uid: string, cid: string, tempDir: string): Promise<string[] | null> => {
  if (typeof window !== "undefined") return null;
  const nodeStorage = StorageFactory.getInstance();
  return await nodeStorage.downloadDirFiles(`${uid}/${cid}/parts/`, tempDir);
};

const getFilePath = (cid: string, uid: string, part?: number) => {
  return `${uid}/${cid}${typeof part === "number" ? `/parts/${part}.mp4` : "/video.mp4"}`;
};
