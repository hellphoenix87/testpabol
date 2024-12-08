import { SHOT_SPEECH_SILENCE, SPEECH_SILENCE_SEPARATOR } from "../constants";
import { FetchedFile, MediaData } from "../interfaces";

export const getShotDuration = (shot: MediaData, files: { [x: string]: FetchedFile }) => {
  return shot.voice.length
    ? shot.voice.reduce(
        (prev, curr) => (files?.[curr]?.duration || files?.[curr]?.value?.duration || 0) * 1000 + prev,
        SHOT_SPEECH_SILENCE * 2 + SPEECH_SILENCE_SEPARATOR * shot.voice.length
      )
    : shot.duration;
};
