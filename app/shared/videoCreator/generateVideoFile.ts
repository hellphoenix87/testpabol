import { cleanup, prepareDirectory, writeFile } from "./utils/fileControl";
import { FetchedShot, InternalOptions } from "./interfaces";
import { renderVideoFactory } from "./renderVideo";
import { Canvas } from "canvas";
import { RESOLUTION } from "./constants";
import { getStrWithMarkers } from "./utils/getStrWithMarkers";
import {
  AudioData,
  VoiceData,
  applyDynamicRangeCompression,
  applyEqualization,
  applyReverb,
  createVideo,
  mergeAudioParts,
  mergeShotVoices,
  trimAudio,
} from "./ffmpeg";
import AudioEqualizationSettings from "../constants/audioEqualizationSettings";
import { AudioEqualizationSettingsType, ReverbsFiles } from "../constants";
import path from "path";

export const generateVideoFile = async (shots: FetchedShot[], options: InternalOptions) => {
  // prepare the temp directory that used for FFMPEG.
  prepareDirectory(options.tempDir);

  try {
    const framesUrls = getImagesUrls(shots, options);
    const audioUrls = await getAudioUrls(shots, options);

    // create the video file
    const res = await createVideo(framesUrls, audioUrls, { fps: options.fps, tempDir: options.tempDir });
    console.log(getStrWithMarkers("Video created successfully ==================>", options.cid), res);
    return res;
  } catch (e) {
    console.log(getStrWithMarkers("Error while creating video ==================>", options.cid), e);
    throw e;
  }
};

export const cleanupDirectory = (dir: string) => {
  cleanup(dir);
};

// get the frames
const getImagesUrls = (shots: FetchedShot[], options: InternalOptions): string[] => {
  const hittingTime = Date.now();

  // create a canvas with the targeted resolution
  const canvas = new Canvas(RESOLUTION.WIDTH, RESOLUTION.HEIGHT);
  options.canvasRef = canvas;
  const renderer = renderVideoFactory(shots, options);
  const urls: string[] = [];
  let framePointer = 0;
  for (let i = 0; i < shots.length; i++) {
    // get each shot frames buffers then save them to reduce the ram usage
    const { images } = renderer.playScenesHandler({ shotIndex: i });
    urls.push(...writeFrames(images, `${options.tempDir || ""}/frames`, framePointer));
    framePointer = urls.length;
    console.log(getStrWithMarkers("Shot completed ==================>", options.cid), i);
  }
  console.log(getStrWithMarkers(`Image files generating took ${Date.now() - hittingTime}`, options.cid, options.part));
  return urls;
};

const updateAudioDuration = (
  audio: { value: string },
  duration: number,
  audioList: Array<{ value: string; duration: number }>
): Array<{ value: string; duration: number }> => {
  const isSameLastAudio = audioList[audioList.length - 1]?.value === audio?.value;

  if (audio && isSameLastAudio) {
    audioList[audioList.length - 1].duration += duration;
    return audioList;
  }

  return [
    ...audioList,
    {
      duration,
      value: audio?.value,
    },
  ];
};

const getAudioUrls = async (
  shots: FetchedShot[],
  options: InternalOptions
): Promise<{ url: string; volume: number }[]> => {
  const FADE_OUT_DURATION = 2.5;

  const hittingTime = Date.now();

  // get the duration for each sound
  const voiceData: VoiceData[] = [];
  let soundData: AudioData[] = [];
  let musicData: AudioData[] = [];

  for (const shot of shots) {
    try {
      soundData = updateAudioDuration(shot.sound, shot.duration, soundData);

      musicData = updateAudioDuration(shot.music, shot.duration, musicData);

      const localReverbFiles = getLocalReverbFiles();

      // apply reverb effect on dialog files
      const voicesWithReverb = await Promise.all(
        shot.voice.map(async voice => {
          if (shot.acousticEnv && ReverbsFiles[shot.acousticEnv] && ReverbsFiles[shot.acousticEnv]?.dryLevel) {
            return applyReverb({
              audioFile: voice.value,
              duration: voice.duration!,
              reverbFile: localReverbFiles[shot.acousticEnv],
              dryLevel: ReverbsFiles[shot.acousticEnv].dryLevel,
              equalizationSettings: getAcousticEnvEqualisationSettings(shot.acousticEnv),
              tempDir: options.tempDir,
            });
          }
          return voice.value;
        })
      );

      voiceData.push({
        value: voicesWithReverb,
        duration: shot.duration,
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  try {
    // prepare the audio files by trimming them
    const [soundFiles, musicFiles, voiceFiles] = await Promise.all([
      Promise.all(soundData.map(item => trimAudio(item, options.tempDir, FADE_OUT_DURATION))),
      Promise.all(musicData.map(item => trimAudio(item, options.tempDir, FADE_OUT_DURATION))),
      Promise.all(voiceData.map(item => mergeShotVoices(item, options.tempDir))),
    ]);

    // Merge audio parts into one file.
    const [soundPartsUrl, musicPartsUrl, voicePartsUrl] = await Promise.all([
      mergeAudioParts(soundFiles, options.tempDir),
      mergeAudioParts(musicFiles, options.tempDir),
      mergeAudioParts(voiceFiles, options.tempDir),
    ]);

    // apply Equalization on the audio files
    const [equalizedSoundPartsUrl, equalizedMusicPartsUrl, equalizedVoicePartsUrl] = await Promise.all([
      applyEqualization(soundPartsUrl, AudioEqualizationSettings.SOUND, options.tempDir),
      applyEqualization(musicPartsUrl, AudioEqualizationSettings.MUSIC, options.tempDir),
      applyEqualization(voicePartsUrl, AudioEqualizationSettings.VOICE, options.tempDir),
    ]);

    // apply Dynamic Range Compression on the audio files
    const [compressedSoundPartsUrl, compressedMusicPartsUrl, compressedVoicePartsUrl] = await Promise.all([
      applyDynamicRangeCompression(equalizedSoundPartsUrl, options.tempDir),
      applyDynamicRangeCompression(equalizedMusicPartsUrl, options.tempDir),
      applyDynamicRangeCompression(equalizedVoicePartsUrl, options.tempDir),
    ]);

    // prepare the final audio files by merging all the parts
    return [
      { url: compressedSoundPartsUrl, volume: options.volume.sound },
      { url: compressedMusicPartsUrl, volume: options.volume.music },
      { url: compressedVoicePartsUrl, volume: options.volume.voice },
    ];
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    const elapsedTime = Date.now() - hittingTime;
    console.log(getStrWithMarkers(`Audio files generating took ${elapsedTime}`, options.cid, options.part));
  }
};

// used to write the frames in a temp directory to be used by ffmpeg
const writeFrames = (frames: Buffer[], basename: string, fromNumber: number) => {
  const res: string[] = [];
  for (let i = 0; i < frames.length; i++) {
    const paddedNumber = String(i + fromNumber).padStart(8, "0");
    res.push(writeFile(frames[i], `${basename}-${paddedNumber}.jpg`));
  }
  return res;
};

export const getLocalReverbFiles = (): Record<string, string> => {
  const localReverbFiles: Record<string, string> = {};

  for (const environmentName of Object.keys(ReverbsFiles)) {
    const environment = ReverbsFiles[environmentName];

    localReverbFiles[environmentName] = getFilePath(environment.path);
  }

  return localReverbFiles;
};

export function getAcousticEnvEqualisationSettings(acoustic_env: string): AudioEqualizationSettingsType[] | undefined {
  switch (acoustic_env) {
    case "telephone":
      return AudioEqualizationSettings.TELEPHONE;
    default:
      return undefined;
  }
}

export const getFilePath = (filePath: string): string => {
  if (process.env.FUNCTIONS_EMULATOR || process.env.NODE_ENV === "test") {
    // The path of the files in local environment (firebase emulator) or local tests
    return path.resolve(`${process.cwd()}/${filePath}`);
  }

  // The path of the files in deployed firebase function
  return path.resolve(`/workspace/${filePath}`);
};
