export interface MediaData {
  sceneIdx: number;
  shotIdx: number;
  music: string;
  sound: string;
  voice: string[];
  acousticEnv: string;
  image: string;
  video?: string;
  duration: number;
  videoDuration?: number;
  fadeIn: number;
  fadeOut: number;
  zoomStart: number;
  zoomEnd: number;
  hasBlackFading: boolean;
  previousImage?: string;
}
