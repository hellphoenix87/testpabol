import { Canvas, loadImage } from "canvas";
import { CanvasBuilder } from "./canvasBuilder";
import { ImageMock, fetchedShotMockFactory } from "./test-utils";
import { DEFAULT_OPTIONS } from "./constants";
import { FetchedShot } from "./interfaces";

describe("VideoCreator CanvasBuilder", () => {
  let shots: FetchedShot[];
  let canvasBuilder: CanvasBuilder;
  let canvas: Canvas;

  beforeAll(async () => {
    const mockedShot = fetchedShotMockFactory({
      image: { value: await loadImage(ImageMock()), filename: "mock-file-name" },
    });
    shots = [mockedShot, mockedShot];
    canvas = new Canvas(1, 1);
    canvas.toBuffer = jest.fn();
  });

  it("start canvas", () => {
    canvasBuilder = new CanvasBuilder(canvas, shots[0], { ...DEFAULT_OPTIONS, animate: true });
    expect(canvasBuilder.animate).toEqual(true);
    canvasBuilder.start();
    expect(canvasBuilder.result.length).toEqual(DEFAULT_OPTIONS.fps * 2);
  });

  it("end canvas should return the scale to be used for the next shot", () => {
    canvasBuilder = new CanvasBuilder(new Canvas(1, 1), shots[0], { ...DEFAULT_OPTIONS, animate: true });
    expect(canvasBuilder.end()).toEqual(canvasBuilder.currentScale);
  });
});
