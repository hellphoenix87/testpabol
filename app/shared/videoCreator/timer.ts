import { INTERVAL_TIME } from "./constants";
import { FetchedShot } from "./interfaces";

export interface TimeProperties {
  shotIndex: number;
  TotalTime: number;
  ShotTime: number;
  totalDuration: number;
  shotDuration: number;
  totalPercentage: number;
  shotPercentage: number;
  isPlaying: boolean;
  isFinished: boolean;
  isLastShot: boolean;
}

export class Timer {
  private _isFinished: boolean;
  private _shotIndex: number;
  private _shotTime: number;
  private _TotalTime: number;
  private _totalDuration: number;
  private _shotDuration: number;
  private _totalPercentage: number;
  private _shotPercentage: number;
  private _shots: FetchedShot[];
  private _interval: any;
  private _playHandler: (prop: TimeProperties) => any;
  private _stopHandler: () => any;
  private _prepareShotHandler: (prop: TimeProperties) => any;
  private fireEvent?: (timeProps: TimeProperties) => any;

  constructor(
    shots: FetchedShot[],
    playHandler: (prop: TimeProperties) => any,
    stopHandler: () => any,
    prepareShotHandler: (prop: TimeProperties) => any,
    timeEvent?: (prop: TimeProperties) => any
  ) {
    this._isFinished = false;
    this._shots = shots;
    this._totalDuration = shots.reduce((p, s) => s.duration + p, 0);
    this._shotDuration = shots[0]?.duration;
    this._shotIndex = 0;
    this._shotTime = 0;
    this._TotalTime = 0;
    this._totalPercentage = 0;
    this._shotPercentage = 0;
    this._playHandler = playHandler;
    this._stopHandler = stopHandler;
    this._prepareShotHandler = prepareShotHandler;

    if (timeEvent) {
      this.fireEvent = timeEvent;
      this.fireEvent(this.timeProperties);
    }
  }

  // play the preview
  play() {
    this._isFinished = false;

    if (this._interval) {
      clearInterval(this._interval);
    }

    this._stopHandler();

    this._interval = setInterval(() => {
      this._shotTime += INTERVAL_TIME;
      this.updateTime(this._shotTime);

      if (this.fireEvent && this._totalPercentage <= 100) {
        this.fireEvent(this.timeProperties);
      }
    }, INTERVAL_TIME);

    this.handleNewShot();
  }

  // stop the preview.
  stop() {
    if (this._interval) {
      clearInterval(this._interval);
    }

    this._interval = undefined;
    this._stopHandler();
    this.fireEvent?.(this.timeProperties);
  }

  // used to move to the next shot.
  nextShot() {
    if (!this.isShotExist(this._shotIndex + 1) || !this.isShotReady(this._shotIndex + 1)) {
      this._isFinished = true;
      return this.stop();
    }

    this._shotIndex++;
    this.handleNewShot();
  }

  // used to move to the previous shot.
  previousShot() {
    if (!this.isShotExist(this._shotIndex - 1)) {
      return this.stop();
    }

    this._shotIndex--;
    this.handleNewShot();
  }

  // used to move to a specific shot automatically or manually.
  goToShot(idx: number) {
    if (this._shotIndex === idx) {
      return;
    }

    if (!this.isShotExist(idx)) {
      return this.stop();
    }

    this._shotIndex = idx;
    this.handleNewShot();
  }

  // update method to handle the interval action.
  updateTime(shotTime: number) {
    if (shotTime > this._shotDuration) {
      return this.nextShot();
    }

    if (!this._shots[this._shotIndex]) {
      return this.stop();
    }

    this._shotTime = shotTime;
    this._shotDuration = this._shots[this._shotIndex].duration;
    this._TotalTime = this._shots.slice(0, this._shotIndex).reduce((p, s) => s.duration + p, 0) + this._shotTime;
    this._totalPercentage = (this._TotalTime / this._totalDuration) * 100;
    this._shotPercentage = (shotTime / this._shotDuration) * 100;
  }

  // triggered to move to a new shot (can be triggered manually or automatically)
  handleNewShot() {
    this.updateTime(0);

    if (this._interval) {
      this._playHandler(this.timeProperties);
      return;
    }

    this._prepareShotHandler(this.timeProperties);
    this.stop();
  }

  updateShots(shots: FetchedShot[]) {
    this._shots = shots;
  }

  updateRenderingHandlers(handlers: {
    playHandler?: (prop: TimeProperties) => any;
    stopHandler?: () => any;
    prepareShotHandler?: (prop: TimeProperties) => any;
  }) {
    const { playHandler, stopHandler, prepareShotHandler } = handlers;

    if (playHandler) {
      this._playHandler = playHandler;
    }

    if (stopHandler) {
      this._stopHandler = stopHandler;
    }

    if (prepareShotHandler) {
      this._prepareShotHandler = prepareShotHandler;
    }
  }

  private isShotExist(idx: number): boolean {
    return !!this._shots[idx];
  }

  private isShotReady(idx: number): boolean {
    return !!this._shots[idx]?.image.value;
  }

  // check if the playback is running.
  get isPlaying(): boolean {
    return !!this._interval;
  }

  // used to get all the current play information
  get timeProperties(): TimeProperties {
    return {
      shotIndex: this._shotIndex,
      TotalTime: this._TotalTime,
      ShotTime: this._shotTime,
      totalDuration: this._totalDuration,
      shotDuration: this._shotDuration,
      totalPercentage: this._totalPercentage,
      shotPercentage: this._shotPercentage,
      isPlaying: this.isPlaying,
      isFinished: this._isFinished,
      isLastShot: this._shotIndex === this._shots.length - 1,
    };
  }
}
