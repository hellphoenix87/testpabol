export interface FetchedFile {
  filename: string;
  cacheKey?: string;
  value: any;
  duration?: number | null;
}

export interface FetchedShot {
  sceneIdx: number;
  shotIdx: number;
  music: FetchedFile;
  sound: FetchedFile;
  voice: FetchedFile[];
  acousticEnv: string;
  image: FetchedFile;
  videoFrames?: FetchedFile;
  duration: number;
  startingTime: number;
  fadeIn: number;
  fadeOut: number;
  zoomStart: number;
  zoomEnd: number;
  hasBlackFading: boolean;
  previousImage?: FetchedFile;
}
