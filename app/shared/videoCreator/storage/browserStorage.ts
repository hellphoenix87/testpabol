import { ref, getDownloadURL, FirebaseStorage, getBytes, getStorage } from "firebase/storage";
import { FetchedFile, FetchedShot, MediaData, Options } from "../interfaces";
import { FirebaseApp } from "firebase/app";
import { getFetchedData } from "../utils";

export const BrowserStorageFactory = (function () {
  let instance: BrowserStorage;

  function createInstance(firebaseApp: FirebaseApp) {
    return new BrowserStorage(firebaseApp);
  }
  return {
    getInstance(firebaseApp: FirebaseApp): BrowserStorage {
      if (!instance) {
        instance = createInstance(firebaseApp);
      }
      return instance;
    },
  };
})();

export class BrowserStorage {
  storages: Record<string, FirebaseStorage>;
  constructor(firebaseApp: FirebaseApp) {
    this.storages = {
      image: getStorage(firebaseApp, process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE),
      voice: getStorage(firebaseApp, process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE),
      sound: getStorage(firebaseApp, process.env.PABOLO_BUCKET_NAME_SOUND_STORAGE),
      music: getStorage(firebaseApp, process.env.PABOLO_BUCKET_NAME_MUSIC_STORAGE),
      public: getStorage(firebaseApp, process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE),
    };
  }

  async downloadFiles(mediaData: MediaData[], options: Options): Promise<FetchedShot[]> {
    const images: FetchedFile[] = [],
      sounds: FetchedFile[] = [],
      voices: FetchedFile[] = [],
      musics: FetchedFile[] = [];

    // get all the media files in separate arrays
    // to run a parallel requests to get all files at the same time
    mediaData.forEach((shot: any) => {
      if (shot.music) {
        musics.push(this.getFileData("music", shot.music, options));
      }
      if (shot.sound) {
        sounds.push(this.getFileData("sound", shot.sound, options));
      }
      if (shot.image) {
        images.push(this.getFileData("image", shot.image, options));
      }
      if (shot.previousImage) {
        images.push({ filename: shot.previousImage, value: null });
      }
      if (shot.voice?.length) {
        shot.voice.forEach((v: string) => voices.push(this.getFileData("voice", v, options)));
      }
    });

    // download the media files
    const files = (
      await Promise.all([
        ...sounds.map(s =>
          this.fetchBlobAudio(s, { storageRef: this.storages.sound, cache: options.cachedDownloads })
        ),
        ...musics.map(m =>
          this.fetchBlobAudio(m, { storageRef: this.storages.music, cache: options.cachedDownloads })
        ),
        ...voices.map(v =>
          this.fetchBlobAudio(v, { storageRef: this.storages.voice, cache: options.cachedDownloads })
        ),
        ...images.map(img =>
          this.fetchImage(img, { storageRef: this.storages.image, cache: options.cachedDownloads })
        ),
      ])
    ).reduce((a: { [x: string]: FetchedFile }, v: FetchedFile): any => {
      if (v) {
        return { ...a, [v.filename]: v };
      }
      return null;
    }, {});

    return getFetchedData(files, mediaData);
  }

  private async fetchBlobAudio(
    file: FetchedFile,
    options: { storageRef: FirebaseStorage; cache?: Record<string, any> }
  ) {
    if (!file.filename || file.value || file.filename === "LOADING") {
      return file;
    }
    const audioContext = new AudioContext();
    const buffer = await getBytes(ref(options.storageRef, file.filename));
    const audioBuffer = await audioContext.decodeAudioData(buffer);
    if (options.cache && file.cacheKey) {
      options.cache[file.cacheKey] = audioBuffer;
    }
    file.value = audioBuffer;
    file.duration = audioBuffer.duration;
    return file;
  }

  // download the image as buffer and load it as js image
  private async fetchImage(
    file: FetchedFile,
    options: { storageRef: FirebaseStorage; cache?: Record<string, any>; cacheKey?: string }
  ) {
    if (!file.filename || file.value) {
      return file;
    }
    const url = await getDownloadURL(ref(options.storageRef, file.filename));
    const img = new Image();
    img.src = url;
    return new Promise<FetchedFile>(resolve => {
      img.onload = () => {
        if (options.cache && file.cacheKey) {
          options.cache[file.cacheKey] = img;
        }
        file.value = img;
        resolve(file);
      };
    });
  }

  private getCacheKey(storageRef: FirebaseStorage, filename: string): string {
    const bucketName = ref(storageRef, filename).bucket;
    return bucketName + "_" + filename;
  }

  private getFileData(key: string, name: string, options: Options) {
    const cacheKey = this.getCacheKey(this.storages[key], name);
    return {
      filename: name,
      cacheKey,
      value: options.cachedDownloads?.[cacheKey],
    };
  }
}
