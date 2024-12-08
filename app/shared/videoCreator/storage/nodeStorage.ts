import { loadImage } from "canvas";
import { FetchedFile, FetchedShot, InternalOptions, MediaData } from "../interfaces";
import { Storage, Bucket, DownloadResponse } from "@google-cloud/storage";
import { generateTempFileUrl, prepareDirectory, getDirFiles } from "../utils/fileControl";
import { getFetchedData } from "../utils";
import { convertVideoToImages, getFileDurationWithRetry } from "../ffmpeg";
import path from "path";

export const NodeStorageFactory = (function () {
  let instance: NodeStorage;

  function createInstance() {
    return new NodeStorage(new Storage());
  }
  return {
    getInstance(): NodeStorage {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    },
  };
})();

export class NodeStorage {
  buckets: Record<string, Bucket>;

  constructor(storage: Storage) {
    this.buckets = {
      image: storage.bucket(process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE || ""),
      voice: storage.bucket(process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE || ""),
      sound: storage.bucket(process.env.PABOLO_BUCKET_NAME_SOUND_STORAGE || ""),
      music: storage.bucket(process.env.PABOLO_BUCKET_NAME_MUSIC_STORAGE || ""),
      public: storage.bucket(process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE || ""),
      video: storage.bucket(process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE || ""),
    };
  }

  async downloadFiles(mediaData: MediaData[], options: InternalOptions): Promise<FetchedShot[]> {
    const images: FetchedFile[] = [],
      sounds: FetchedFile[] = [],
      voices: FetchedFile[] = [],
      musics: FetchedFile[] = [],
      videos: FetchedFile[] = [];

    options.tempDir && prepareDirectory(options.tempDir);

    // get all the media files in separate arrays
    // to run a parallel requests to get all files at the same time
    mediaData.forEach(shot => {
      if (shot.music) {
        musics.push({ filename: shot.music, value: null });
      }
      if (shot.sound) {
        sounds.push({ filename: shot.sound, value: null });
      }
      if (shot.image) {
        images.push({ filename: shot.image, value: null });
      }
      if (shot.video) {
        videos.push({ filename: shot.video, duration: shot.duration, value: null });
      }
      if (shot.previousImage) {
        images.push({ filename: shot.previousImage, value: null });
      }
      if (shot.voice?.length) {
        shot.voice.forEach((v: string) => voices.push({ filename: v, value: null }));
      }
    });

    // download the media files
    const files = (
      await Promise.all([
        ...sounds.map(s => this.downloadAudioFile(this.buckets.sound, s, options.tempDir)),
        ...musics.map(m => this.downloadAudioFile(this.buckets.music, m, options.tempDir)),
        ...voices.map(v => this.downloadAudioFile(this.buckets.voice, v, options.tempDir)),
        ...images.map(img => this.downloadImageFile(this.buckets.image, img)),
        ...videos.map(vid => this.downloadVideoFile(this.buckets.video, vid, options)),
      ])
    ).reduce((a: { [x: string]: FetchedFile }, v: FetchedFile): any => {
      if (v) {
        return { ...a, [v.filename]: v };
      }
      return null;
    }, {});

    return getFetchedData(files, mediaData);
  }

  private downloadImageFile = async (bucket: Bucket, file: FetchedFile): Promise<FetchedFile> => {
    [file.value] = await bucket.file(file.filename).download();
    file.value = await loadImage(file.value);
    return file;
  };

  private downloadAudioFile = async (bucket: Bucket, file: FetchedFile, directory?: string): Promise<FetchedFile> => {
    if (file.value) {
      return file;
    }
    const destination = generateTempFileUrl(bucket.name + "-" + file.filename, directory);
    await bucket.file(file.filename).download({ destination });
    file.value = destination;
    file.duration = (await getFileDurationWithRetry(file.value, 10)) as number;
    return file;
  };

  private downloadVideoFile = async (
    bucket: Bucket,
    file: FetchedFile,
    options: InternalOptions
  ): Promise<FetchedFile> => {
    if (file.value) {
      return file;
    }
    const destination = generateTempFileUrl(bucket.name + "-" + file.filename, options.tempDir);
    await bucket.file(file.filename).download({ destination });
    const frameUrls = await convertVideoToImages({
      video: destination,
      fps: options.fps,
      tempDir: options.tempDir,
    });
    file.value = await Promise.all(frameUrls.map(url => loadImage(url)));
    return file;
  };

  async uploadFile(file: string, name: string) {
    const fileObject = await this.buckets.video.upload(file, { destination: name });
    return fileObject[0].publicUrl();
  }

  async uploadDir(directory: string, target: string) {
    const files = getDirFiles(directory);
    await Promise.all(
      files.map(file => this.buckets.video.upload(path.join(directory, file), { destination: `${target}/${file}` }))
    );
    return target;
  }

  async checkFile(name: string): Promise<string | null> {
    const file = this.buckets.video.file(name);
    return (await file.exists())?.[0] ? this.getFileURL(this.buckets.video, name) : null;
  }

  getFileURL(bucket: Bucket, name: string): string {
    return "https://storage.googleapis.com/" + bucket.name + "/" + name;
  }

  async downloadDirFiles(prefix: string, tempDir: string) {
    const directory = prepareDirectory(tempDir);
    const [files] = await this.buckets.video.getFiles({ prefix });
    const urls: string[] = [];
    const promises: Promise<DownloadResponse>[] = [];
    for (const file of files) {
      // Skip the directory blob itself.
      if (file.name.endsWith("/")) {
        continue;
      }
      const fileUrl = `${directory}/${file.name.split("/").pop()}`;
      // prepare all files to be downloaded
      promises.push(file.download({ destination: fileUrl }));
      urls.push(fileUrl);
    }
    // Download the files.
    await Promise.all(promises);
    return urls;
  }
}
