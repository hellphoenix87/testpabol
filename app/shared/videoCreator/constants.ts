import { InternalOptions } from "./interfaces";

export const DEFAULT_OPTIONS: InternalOptions = {
  shot_default_duration: 3000,
  fps: 25,
  env: typeof window === "undefined" ? "node" : "browser",
  volume: { music: 0.16, sound: 0.16, voice: 10 },
  fade: 1,
  zoomIntensity: 0.03,
  tempDir: "temp-dir",
  mimeType: "image/jpeg",
} as const;

export const AUDIO_FREQUENCY = 44100;
export const SPEECH_SILENCE_SEPARATOR = 200; // pause length between dialogs
export const SHOT_SPEECH_SILENCE = 900; // silence padding at the beginning and end of each shot
export const INTERVAL_TIME = 50;
export const RESOLUTION = { WIDTH: 512, HEIGHT: 288 };
