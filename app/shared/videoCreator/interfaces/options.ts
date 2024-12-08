import { FirebaseApp } from "firebase/app";
import { TimeProperties } from "../timer";
import { Canvas } from "canvas";
import { CanvasBuilder } from "../canvasBuilder";

export type MimeType = "image/png" | "image/jpeg";
/**
 * Options used to control the behavior.
 * @public
 */
export interface Options {
  /**
   * user id
   */
  uid?: string;

  /**
   * creation id
   */
  cid?: string;

  /**
   * Part is the Scene index
   * Use this to run preview or generate one scene.
   * @default undefined
   */
  part?: number;
  /**
   * Used only in the browser env.
   */
  firebaseApp?: FirebaseApp;

  /**
   * set the shot duration in ms.
   * @default 3000
   */
  shot_default_duration?: number;

  /**
   * Frames Per Seconds.
   * @default 25
   */
  fps?: number;

  /**
   * used to inform the library which downloads already completed so will return its data directly
   */
  cachedDownloads?: Record<string, any>;

  /**
   * Canvas ref in the frontend
   */
  canvasRef?: Canvas | HTMLCanvasElement | null;

  /**
   * this method will be called every 200 while this video is played.
   */
  percentageHandler?: (percentage: TimeProperties) => any;

  /**
   * used to control the sound volumes
   * @default {
   *   music: 0.2, sound: 0.2, voice: 1
   * }
   */
  volume?: { music: number; sound: number; voice: number };

  /**
   * fade time in seconds
   * @default 1
   */
  fade?: number;

  /**
   * zoom intensity
   * @default .03
   */
  zoomIntensity?: number;

  /**
   * the image encoding type
   * @default "image/jpeg"
   */
  mimeType?: MimeType;
}
export interface InternalOptions extends Options {
  env: "browser" | "node";
  shot_default_duration: number;
  part?: number;
  fps: number;
  volume: { music: number; sound: number; voice: number };
  mimeType: MimeType;
  fade: number;
  zoomIntensity: number;
  currentCanvas?: CanvasBuilder | null;
  tempDir: string;
}
