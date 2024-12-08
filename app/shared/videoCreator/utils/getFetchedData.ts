import { FetchedFile, FetchedShot, MediaData } from "../interfaces";
import { getShotDuration } from "./getShotDuration";

// add the downloaded data back
// and increase the duration if needed based on the dialogs duration.
export const getFetchedData = (files: { [x: string]: FetchedFile }, mediaData: MediaData[]): FetchedShot[] => {
  let startingTime = 0;
  let sceneIdx = -1;
  let oldDuration = 0;
  return mediaData.map(shot => {
    if (shot.sceneIdx != sceneIdx) {
      startingTime = 0;
      oldDuration = 0;
    }
    const duration = shot.videoDuration || getShotDuration(shot, files);
    startingTime = startingTime + oldDuration;
    oldDuration = duration;
    sceneIdx = shot.sceneIdx;
    return {
      ...shot,
      image: files[shot.image],
      videoFrames: shot.video ? files[shot.video] : undefined,
      music: files[shot.music],
      sound: files[shot.sound],
      acousticEnv: shot.acousticEnv,
      previousImage: shot.previousImage ? files[shot.previousImage] : undefined,
      voice: shot.voice?.map(v => files[v]),
      duration,
      startingTime,
    };
  });
};
