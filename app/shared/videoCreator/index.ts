import { DEFAULT_OPTIONS, SHOT_SPEECH_SILENCE, SPEECH_SILENCE_SEPARATOR } from "./constants";
import { Scene, Options, InternalOptions, FetchedShot, StreamInfo, AccessPrivilege, ShotDuration } from "./interfaces";
import { checkVideoFile, downloadMediaFiles, getVideoParts, uploadVideoFile, uploadStream } from "./storage";
import { renderVideoFactory } from "./renderVideo";
import { Timer } from "./timer";
import { getMediaData } from "./prepareData";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { getStrWithMarkers } from "./utils/getStrWithMarkers";
import { Env } from "./enum";

let generateVideo: (shots: FetchedShot[], options: InternalOptions) => Promise<string>;
let mergeStream: (parts: string[], options: InternalOptions) => Promise<StreamInfo>;
let cleanup: (dir: string) => void;
let getFileDur: (file: string, times?: number) => Promise<number | void>;

if (typeof window === "undefined") {
  import("./generateVideoFile").then(({ generateVideoFile, cleanupDirectory }) => {
    generateVideo = generateVideoFile;
    cleanup = cleanupDirectory;
  });
  import("./ffmpeg").then(({ mergeStreamFiles, getFileDurationWithRetry }) => {
    mergeStream = mergeStreamFiles;
    getFileDur = getFileDurationWithRetry;
  });
}

export class VideoCreator {
  private scenes?: { targeted: Scene[]; original: Scene[] };
  public fetchedShots?: FetchedShot[];
  private options: InternalOptions;
  private timer?: Timer;

  private elapsedMergingTime: number = -1;
  private elapsedSceneTime: number[] = [];

  constructor(options: Options) {
    this.options = this.generateNewOptions(options);
  }

  /**
   * Used to generate media files data
   * @public
   */
  public async generate(scenes: Scene[], part?: number, destroy = true): Promise<void> {
    const currentPart = part;

    if (destroy) {
      this.timer?.stop();
    }

    this.scenes = {
      original: scenes,
      targeted: _.cloneDeep(scenes),
    };

    if (typeof part === "number") {
      this.options.part = part;
      this.scenes.targeted = [this.scenes.targeted[this.options.part]];
    }

    if (!this.scenes.targeted?.length) {
      throw new Error("Targeted scenes are not exist.");
    }

    const mediaData = getMediaData(this.scenes, this.options);
    this.fetchedShots = await downloadMediaFiles(mediaData, this.options);

    // does user switched to another scene.
    const isNewSceneRunning = currentPart !== this.options.part;
    if (this.options.env !== Env.BROWSER || !this.options.canvasRef || isNewSceneRunning) {
      return;
    }

    const renderer = renderVideoFactory(this.fetchedShots, this.options);

    if (destroy) {
      this.timer = new Timer(
        this.fetchedShots,
        renderer.playScenesHandler,
        renderer.stopScenesHandler,
        renderer.prepareShotHandler,
        this.options.percentageHandler
      );
      return;
    }

    this.timer?.updateShots(this.fetchedShots);
    this.timer?.updateRenderingHandlers({
      playHandler: renderer.playScenesHandler,
      prepareShotHandler: renderer.prepareShotHandler,
      stopHandler: renderer.stopScenesHandler,
    });
  }

  /**
   * Used in the browser env to play the video
   * @public
   */
  public play() {
    this.validateAccess({ methodName: "play", env: Env.BROWSER, isReady: true, hasCanvas: true });

    if (this.fetchedShots?.length) {
      this.timer?.play();
    }
  }

  /**
   * Used in the browser env to stop the video
   * @public
   */
  public stop() {
    this.validateAccess({ methodName: "stop", env: Env.BROWSER });

    this.timer?.stop();
  }

  /**
   * Used to move to existing shot number in the passed scenes and play it
   * @public
   */
  public invokeShot(index: number) {
    this.validateAccess({ methodName: "invokeShot", isReady: true, env: Env.BROWSER, hasCanvas: true });

    if (this.fetchedShots?.[index]) {
      this.timer?.goToShot(index);
    }
  }

  /**
   * Used to return the total duration in ms
   * @public
   */
  public get duration(): number {
    this.validateAccess({ methodName: "duration", isReady: true });

    return this.fetchedShots!.reduce((prev, curr) => curr.duration + prev, 0);
  }

  /**
   * get the playing status
   * @public
   */
  public get isPlaying(): boolean {
    this.validateAccess({ methodName: "isPlaying", env: Env.BROWSER });

    return !!(this.timer && this.timer?.isPlaying);
  }

  /**
   * get the ready status
   * @public
   */
  public get isReady(): boolean {
    return !!this.fetchedShots;
  }

  /**
   * Override the old options
   * this will clear the old scenes object to generate new one
   * @public
   */
  public updateOptions(options: Options): void {
    this.fetchedShots = undefined;
    this.options = this.generateNewOptions(options);
  }

  private generateNewOptions(options: Options): InternalOptions {
    return {
      ...DEFAULT_OPTIONS,
      ...options,
      tempDir: uuid(),
      mimeType: options.mimeType || DEFAULT_OPTIONS.mimeType,
    };
  }

  /**
   * create an mp4 video file on the bucket and return the video url.
   * @public
   */
  public async createFile(): Promise<string> {
    const hittingTime = Date.now();

    const uid = this.options.uid;
    const cid = this.options.cid;

    this.validateAccess({ methodName: "createFile", env: Env.NODE, isReady: true });

    if (!cid || !uid) {
      throw new Error("Please run generate to use this method");
    }

    try {
      const alreadyExistVideoFile = await checkVideoFile(cid, uid, this.options.part);

      if (alreadyExistVideoFile) {
        return alreadyExistVideoFile;
      }

      // logging how many shots we have in the video
      console.log(
        this.getLogWithMarkers(`Number of the shots for scene ${this.options.part} ===> ${this.fetchedShots?.length}`)
      );
      const videoFile = await generateVideo?.(this.fetchedShots!, this.options);
      const url = await uploadVideoFile(videoFile, { cid, uid, part: this.options.part });

      cleanup(this.options.tempDir);

      this.fetchedShots = undefined;

      return url;
    } catch (e) {
      cleanup(this.options.tempDir);
      this.fetchedShots = undefined;
      throw e;
    } finally {
      this.elapsedSceneTime[this.options.part!] = Date.now() - hittingTime;
    }
  }

  /**
   * merge the video parts into one stream video.
   * @public
   */
  public async mergeVideos(uid: string, cid: string): Promise<{ url: string; duration?: number | null }> {
    const hittingTime = Date.now();

    this.validateAccess({ methodName: "mergeVideos", env: Env.NODE });

    try {
      const videoFiles = await getVideoParts(uid, cid, this.options.tempDir);

      if (!videoFiles?.length) {
        throw new Error("No video parts to merge");
      }

      const streamInfo = await mergeStream(videoFiles, this.options);
      const duration = (await getFileDur(`${streamInfo.directory}/${streamInfo.init}`, 2)) as number;
      const streamOutput = await uploadStream(streamInfo, { cid, uid });

      cleanup(this.options.tempDir);

      return { url: streamOutput, duration };
    } catch (e) {
      cleanup(this.options.tempDir);
      throw e;
    } finally {
      this.elapsedMergingTime = Date.now() - hittingTime;
    }
  }

  /**
   * Get the shots duration.
   * @public
   */
  getShotsDuration(): ShotDuration[] {
    this.validateAccess({ methodName: "getShotsDuration", isReady: true });
    return this.fetchedShots!.map(item => ({
      sceneIdx: item.sceneIdx,
      shotIdx: item.shotIdx,
      duration: item.duration,
      dialog: item.voice.reduce(
        (p, c, i) => {
          p.dialogs[i] = p.pointer;
          p.pointer += (c.duration || 0) * 1000;
          p.pointer += SPEECH_SILENCE_SEPARATOR;
          return p;
        },
        { dialogs: [] as number[], pointer: SHOT_SPEECH_SILENCE }
      ).dialogs,
    }));
  }

  public getElapsedTime(): { merging: number; scenes: number[] } {
    return {
      merging: this.elapsedMergingTime,
      scenes: this.elapsedSceneTime,
    };
  }

  private getLogWithMarkers(str: string): string {
    return getStrWithMarkers(str, this.options.cid);
  }

  private validateAccess(accessPrivilege: AccessPrivilege) {
    if (accessPrivilege.env === Env.NODE && this.options.env !== Env.NODE) {
      throw new Error(accessPrivilege.methodName + " is only supported in the Node app");
    }
    if (accessPrivilege.env === Env.BROWSER && this.options.env !== Env.BROWSER) {
      throw new Error(accessPrivilege.methodName + " only supported in browser");
    }
    if (accessPrivilege.isReady && !this.isReady) {
      throw new Error("Please run generate to use this method");
    }
    if (accessPrivilege.hasCanvas && !this.options.canvasRef) {
      throw new Error(`To use ${accessPrivilege.methodName}, you need a canvas`);
    }
  }
}
