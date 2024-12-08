import { FetchedShot, InternalOptions } from "./interfaces";
import * as audioPlayer from "./audioPlayer";
import { AudioParams, AudioTracksType } from "./audioPlayer";
import { TimeProperties } from "./timer";
import { CanvasBuilder } from "./canvasBuilder";
import { SHOT_SPEECH_SILENCE, SPEECH_SILENCE_SEPARATOR } from "./constants";

export interface Renderer {
  playScenesHandler: (timeProps: TimeProperties | { shotIndex: number }) => { images: Buffer[] };
  stopScenesHandler: () => void;
  prepareShotHandler: (timeProps: TimeProperties | { shotIndex: number }) => Buffer[] | void;
}

const audioTracks: AudioTracksType = {
  AMBIENT: null,
  MUSIC: null,
  DIALOG: null,
};

// play the audio file
// if the audio file is already exist                     => no change
// if the audio file is different                         => replace
// if there is no existing audio running add the new one  => replace
function playAudioOnTrack(audioParams: AudioParams) {
  if (!audioParams.audio && audioParams.tracks[audioParams.type] && !audioParams.add) {
    audioPlayer.stop(audioParams.tracks[audioParams.type] as AudioBuffer);
    audioParams.tracks[audioParams.type] = null;
    return;
  }

  if (
    audioParams.tracks[audioParams.type] &&
    audioParams.tracks[audioParams.type] !== audioParams.audio &&
    !audioParams.add
  ) {
    audioPlayer.stop(audioParams.tracks[audioParams.type] as AudioBuffer);
    audioParams.startingTime = 0.0;
  }

  audioPlayer.play(audioParams);
  audioParams.tracks[audioParams.type] = audioParams.audio as AudioBuffer;
}

// draw the shot by creating a canvas and draw the frames.
const drawShot = (shots: FetchedShot[], idx: number, options: InternalOptions, animate: boolean): Buffer[] | void => {
  const canvas = options.canvasRef;
  if (!canvas) {
    throw new Error("Can't draw on null canvas");
  }
  let oldScale: number | undefined;
  // if there the canvas already used end it and create new one.
  if (options.currentCanvas) {
    oldScale = options.currentCanvas?.end();
  }
  if (shots[idx]?.image.value) {
    options.currentCanvas = new CanvasBuilder(canvas as HTMLCanvasElement, shots[idx], {
      animate,
      oldImage: shots[idx].previousImage,
      oldScale,
      ...options,
    });
    options.currentCanvas.start();
    return options.currentCanvas?.result;
  }
};

// play the shot audio files by running them on three separate contexts
const playShotAudio = (shot: FetchedShot, volume?: Record<string, number>) => {
  const startingTime = shot.startingTime / 1000;
  const musicStartTime = shot.music?.duration ? startingTime % shot.music.duration : startingTime;
  const soundStartTime = shot.sound?.duration ? startingTime % shot.sound.duration : startingTime;
  playAudioOnTrack({
    audio: shot.music?.value,
    tracks: audioTracks,
    type: "MUSIC",
    volume: volume?.music || 0.5,
    startingTime: musicStartTime,
    loop: true,
  });
  playAudioOnTrack({
    audio: shot.sound?.value,
    tracks: audioTracks,
    type: "AMBIENT",
    volume: volume?.sound || 0.5,
    startingTime: soundStartTime,
    loop: true,
  });
  let voiceTime = SHOT_SPEECH_SILENCE / 1000;
  for (let i = 0; i < shot.voice.length; i++) {
    const audio = shot.voice[i].value;
    if (!audio) {
      continue;
    }
    playAudioOnTrack({
      audio,
      tracks: audioTracks,
      type: "DIALOG",
      volume: volume?.voice || 1,
      delay: voiceTime,
      reset: i === 0,
      add: true,
    });
    voiceTime += (audio.duration as number) + SPEECH_SILENCE_SEPARATOR / 1000;
  }
  return null;
};

// remove any audio file running.
const resetAudios = () => {
  playAudioOnTrack({ audio: null, tracks: audioTracks, type: "MUSIC" });
  playAudioOnTrack({ audio: null, tracks: audioTracks, type: "AMBIENT" });
  playAudioOnTrack({ audio: null, tracks: audioTracks, type: "DIALOG" });
  audioPlayer.stopAll();
  return true;
};

// a wrapper play method, used to genrate frames audio.
const playShot = (shot: FetchedShot[], idx: number, options: InternalOptions): { images: Buffer[] } => {
  if (options.env === "browser") {
    playShotAudio(shot[idx], options.volume);
  }
  return {
    images: drawShot(shot, idx, options, true) || [],
  };
};

// a factory used by each call to make the canvas control unique per each user.
export const renderVideoFactory = (shots: FetchedShot[], options: InternalOptions): Renderer => {
  // use the old canvas to keep the ability to stop it.
  const currentCanvas: CanvasBuilder | null = options.currentCanvas || null;
  options.currentCanvas = currentCanvas;
  return {
    // play handler
    playScenesHandler: (timeProps: TimeProperties | { shotIndex: number }) => {
      if (!shots[timeProps.shotIndex]) {
        return { images: [] };
      }
      return playShot(shots, timeProps.shotIndex, options);
    },
    // stop handler
    stopScenesHandler: () => {
      resetAudios();
      options.currentCanvas?.end();
    },
    // prepare shot by loading the preview image.
    prepareShotHandler: (timeProps: TimeProperties | { shotIndex: number }) => {
      options.canvasRef && shots[timeProps.shotIndex] && drawShot(shots, timeProps.shotIndex, options, false);
    },
  };
};
