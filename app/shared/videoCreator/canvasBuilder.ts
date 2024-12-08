import { Canvas } from "canvas";
import { FetchedFile, FetchedShot, CanvasOptions, MimeType } from "./interfaces";
import { getCanvasHeight } from "./utils/canvas";

export class CanvasBuilder {
  private ctx: CanvasRenderingContext2D | null;
  private oldctx: CanvasRenderingContext2D | null;
  private image: FetchedFile;
  private videoFrames?: CanvasImageSource[];
  private oldImage: FetchedFile | undefined;
  private height: number;
  private width: number;
  private alpha: number;
  private deltaIn: number;
  private deltaOut: number;
  private timeoutID: any;
  private scale: number;
  private fadeOutFrames: number;
  private framesCount: number;
  private currentFrame: number;
  private frameTime: number;
  private hasBlackFading: boolean;
  private canvas: HTMLCanvasElement | Canvas;
  private realTime: boolean;
  private mimeType: MimeType;
  public animate: boolean;
  public result: Buffer[] = [];
  public currentScale: number;
  public oldScale: number;

  constructor(canvas: HTMLCanvasElement | Canvas, shot: FetchedShot, options: CanvasOptions) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.oldctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    if (this.ctx === null) {
      throw new Error("Can't draw on null context");
    }
    this.oldImage = options.oldImage;
    this.oldScale = options.oldScale || 1;
    this.image = shot.image;
    this.videoFrames = shot.videoFrames?.value;
    this.height = canvas.height = getCanvasHeight(canvas as HTMLCanvasElement);
    this.width = canvas.width;
    this.alpha = shot.fadeIn ? 0 : 1;
    this.frameTime = Math.floor(1000 / options.fps);
    this.framesCount = Math.floor(options.fps * (shot.duration / 1000));
    this.fadeOutFrames = Math.floor(options.fps * shot.fadeOut || 0);
    this.currentFrame = 0;
    this.deltaIn = shot.fadeIn ? this.frameTime / (shot.fadeIn * 1000) : 0;
    this.deltaOut = shot.fadeOut ? this.frameTime / (shot.fadeOut * 1000) : 0;
    this.currentScale = shot.zoomStart;
    this.hasBlackFading = shot.hasBlackFading;
    this.animate = options.animate;
    this.result = [];
    this.mimeType = options.mimeType;
    this.realTime = !(this.canvas as Canvas).toBuffer;
    this.scale = (shot.zoomEnd - shot.zoomStart) / this.framesCount;
  }

  public start() {
    if (!this.ctx) {
      return;
    }
    if (!this.animate) {
      return this.drawImage(this.image.value);
    }
    if (this.currentFrame >= this.framesCount) {
      return this.end();
    }

    // draw the image with the default background that used to fade.
    const img = this.getCurrentImage(this.currentFrame);
    if (img) {
      this.drawImage(img, this.alpha, this.hasBlackFading ? "0,0,0" : "255,255,255");
    }

    this.adjustAlphaScale();
    this.currentFrame++;
    this.currentScale += this.scale;

    // realtime means browser rendering but backend needs to render the images as soon as it can
    this.realTime ? (this.timeoutID = setTimeout(() => this.start(), this.frameTime)) : this.start();
  }

  public end(): number | undefined {
    // clear the current timeout only if it is not an animation.
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }

    this.ctx = null;
    return this.currentScale;
  }

  private getCurrentImage(frame: number): CanvasImageSource {
    if (!this.videoFrames?.length) {
      return this.image.value;
    }
    return this.videoFrames[frame] || this.videoFrames[0];
  }

  private drawImage(img: CanvasImageSource, opacity = 1, color = "255, 255, 255") {
    if (!this.ctx) {
      return;
    }

    // draw the main image with the targeted scale and opacity
    const validOpacity = +opacity.toFixed(2);

    this.ctx.save();
    this.ctx.scale(this.currentScale, this.currentScale);
    this.ctx.globalAlpha = validOpacity;
    // draw image from px 0 to the canvas width, px 0 to the canvas height.
    this.ctx.drawImage(img, 0, 0, this.width, this.height);
    const reversedOpacity = 1 - validOpacity;
    this.ctx.restore();
    if (this.oldImage && validOpacity < 1 && this.oldctx) {
      // draw the old image with the old scale and reversed opacity
      // used to fade out the old shot image
      this.oldctx.save();
      this.oldctx.scale(this.oldScale, this.oldScale);
      this.oldctx.globalAlpha = reversedOpacity;
      // draw image from px 0 to the canvas width, px 0 to the canvas height.
      this.oldctx.drawImage(this.oldImage.value, 0, 0, this.width, this.height);
      // reset the context scale after drawing.
      this.oldctx.setTransform(1, 0, 0, 1, 0, 0);
      this.oldctx.restore();
    } else if (validOpacity < 1) {
      // draw a rect shape with opacity to apply the fading.
      this.ctx.rect(0, 0, this.width, this.height);
      this.ctx.fillStyle = `rgba(${color},${reversedOpacity})`;
      this.ctx.fill();
    }
    // if the canvas is a node.js canvas get a buffer image to use as a frame for video creation.
    if ((this.canvas as Canvas).toBuffer) {
      this.result.push((this.canvas as any).toBuffer(this.mimeType, { quality: 1 }));
    }
  }

  // adjust the alpha to increase in fade in and to decrease in fade out.
  private adjustAlphaScale() {
    if (this.hasBlackFading && this.fadeOutFrames && this.currentFrame + 8 >= this.framesCount - this.fadeOutFrames) {
      this.alpha -= this.deltaOut;
    } else if (this.alpha <= 1) {
      this.alpha += this.deltaIn;
    }
  }
}
