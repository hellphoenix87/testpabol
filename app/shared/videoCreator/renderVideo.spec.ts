import { Canvas } from "canvas";
import { DEFAULT_OPTIONS } from "./constants";
import { InternalOptions } from "./interfaces";
import { renderVideoFactory } from "./renderVideo";
import { fetchedShotMockFactory } from "./test-utils";
import { CanvasBuilder } from "./canvasBuilder";
import * as audioPlayer from "./audioPlayer";

const startCanvasMock = jest.fn();
const endCanvasMock = jest.fn();

jest.mock("./audioPlayer");
jest.mock("./canvasBuilder", () => ({
  CanvasBuilder: jest.fn().mockImplementation(() => ({
    start: startCanvasMock,
    end: endCanvasMock,
  })),
}));

describe("RenderVideo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("call playScenesHandler should trigger a new canvas shot", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, canvasRef: new Canvas(1, 1) };
    const videoRenderer = renderVideoFactory([fetchedShotMockFactory(), fetchedShotMockFactory()], tempOptions);

    videoRenderer.playScenesHandler({ shotIndex: 0 });
    expect(startCanvasMock).toHaveBeenCalled();
    expect(tempOptions.currentCanvas).toBeDefined();
  });

  it("call playScenesHandler should stop the old canvas shot", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, canvasRef: new Canvas(1, 1) };
    const videoRenderer = renderVideoFactory([fetchedShotMockFactory(), fetchedShotMockFactory()], tempOptions);

    videoRenderer.playScenesHandler({ shotIndex: 0 });
    videoRenderer.playScenesHandler({ shotIndex: 1 });
    expect(endCanvasMock).toHaveBeenCalled();
  });

  it("call stopScenesHandler should stop the current canvas shot", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, canvasRef: new Canvas(1, 1) };
    const videoRenderer = renderVideoFactory([fetchedShotMockFactory(), fetchedShotMockFactory()], tempOptions);

    videoRenderer.playScenesHandler({ shotIndex: 0 });
    videoRenderer.stopScenesHandler();
    expect(endCanvasMock).toHaveBeenCalled();
  });

  it("prepareShotHandler should create a new canvas shot with animation equal false", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, canvasRef: new Canvas(1, 1) };
    const videoRenderer = renderVideoFactory([fetchedShotMockFactory(), fetchedShotMockFactory()], tempOptions);

    videoRenderer.prepareShotHandler({ shotIndex: 0 });
    expect(startCanvasMock).toHaveBeenCalled();
    expect(CanvasBuilder).toHaveBeenCalledWith(tempOptions.canvasRef, fetchedShotMockFactory(), {
      ...tempOptions,
      animate: false,
      currentCanvas: null,
    });
  });

  it("Throw Error if canvas does not exists", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS };
    const videoRenderer = renderVideoFactory([fetchedShotMockFactory(), fetchedShotMockFactory()], tempOptions);
    expect(() => videoRenderer.playScenesHandler({ shotIndex: 0 })).toThrow("Can't draw on null canvas");
  });

  it("Should call the audio player with the should starting time", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, env: "browser", canvasRef: new Canvas(1, 1) };
    const mockedShot = { ...fetchedShotMockFactory(), startingTime: 5000 };
    const videoRenderer = renderVideoFactory([mockedShot], tempOptions);
    videoRenderer.playScenesHandler({ shotIndex: 0 });
    expect(audioPlayer.play).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "MUSIC",
        startingTime: 5,
        loop: true,
      })
    );
  });

  it("Should call the audio player with the correct speech delay", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, env: "browser", canvasRef: new Canvas(1, 1) };
    const mockedShot = { ...fetchedShotMockFactory(), startingTime: 5000 };
    const videoRenderer = renderVideoFactory([mockedShot], tempOptions);
    videoRenderer.playScenesHandler({ shotIndex: 0 });
    expect(audioPlayer.play).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "DIALOG",
        delay: 0.9,
      })
    );
  });

  it("Should call the audio player for Music, Dialog and Sound", () => {
    const tempOptions: InternalOptions = { ...DEFAULT_OPTIONS, env: "browser", canvasRef: new Canvas(1, 1) };
    const mockedShot = { ...fetchedShotMockFactory(), startingTime: 5000 };
    const videoRenderer = renderVideoFactory([mockedShot], tempOptions);
    videoRenderer.playScenesHandler({ shotIndex: 0 });
    expect(audioPlayer.play).toHaveBeenCalledWith(expect.objectContaining({ type: "DIALOG" }));
    expect(audioPlayer.play).toHaveBeenCalledWith(expect.objectContaining({ type: "MUSIC" }));
    expect(audioPlayer.play).toHaveBeenCalledWith(expect.objectContaining({ type: "AMBIENT" }));
  });
});
