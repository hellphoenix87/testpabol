import { DEFAULT_OPTIONS } from "./constants";
import { fetchedShotMockFactory } from "./test-utils";
import fs from "fs";
import os from "os";

const mockTemp = "mock-temp-url";
const mockCreateVideo = jest.fn(async () => new Promise(resolve => resolve("created-video-file-url")));
const mockMergeAudioParts = jest.fn(async () => new Promise(resolve => resolve("created-stream-url")));
const mockMergeShotVoices = jest.fn(async () => new Promise(resolve => resolve("voice-file-url")));
const mockTrimAudio = jest.fn(async () => new Promise(resolve => resolve("trimmed-audio-file-url")));
const mockPlayScenesHandler = jest.fn(() => ({ images: ["image-file-url"] }));

jest.mock("os");
jest.mock("fs");
jest.spyOn(os, "tmpdir").mockReturnValue(mockTemp);
jest.mock("./ffmpeg", () => ({
  createVideo: mockCreateVideo,
  mergeAudioParts: mockMergeAudioParts,
  mergeShotVoices: mockMergeShotVoices,
  trimAudio: mockTrimAudio,
  applyDynamicRangeCompression: jest.fn(async url => new Promise(resolve => resolve(url))),
  applyEqualization: jest.fn(async url => new Promise(resolve => resolve(url))),
  applyReverb: jest.fn(async () => new Promise(resolve => resolve("voice-reverb-file-url"))),
}));

jest.mock("./renderVideo", () => ({
  renderVideoFactory: () => ({
    playScenesHandler: mockPlayScenesHandler,
  }),
}));

import { cleanupDirectory, generateVideoFile } from "./generateVideoFile";

const mockShot = fetchedShotMockFactory();
describe("VideoCreator generateVideoFile", () => {
  const prevLog = console.log;

  beforeAll(() => {
    console.log = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  afterAll(() => {
    console.log = prevLog;
  });

  describe("generateVideoFile", () => {
    it("should prepare the directory", async () => {
      await generateVideoFile([mockShot], DEFAULT_OPTIONS);
      expect(fs.mkdirSync).toHaveBeenCalled();
    });

    it("should generate images from the renderer and call ffmpeg create video file", async () => {
      await generateVideoFile([mockShot], DEFAULT_OPTIONS);
      expect(mockPlayScenesHandler).toHaveBeenCalledWith({ shotIndex: 0 });
      expect(mockCreateVideo).toHaveBeenCalledWith(
        [expect.stringMatching(RegExp(`mock-temp-url[/\\\\]temp-dir[/\\\\]frames-00000000[.]jpg`))],
        [0.16, 0.16, 10].map(volume => ({ url: "created-stream-url", volume })),
        { fps: 25, tempDir: "temp-dir" }
      );
    });

    it("should trim audio files and generate the final audio urls", async () => {
      await generateVideoFile([mockShot], DEFAULT_OPTIONS);
      expect(mockMergeAudioParts).toHaveBeenCalledWith(["trimmed-audio-file-url"], "temp-dir");
      expect(mockMergeShotVoices).toHaveBeenCalledWith(
        { duration: 2000, value: ["voice-reverb-file-url"] },
        "temp-dir"
      );
      expect(mockTrimAudio).toHaveBeenCalledWith({ duration: 2000, value: "mock-image-value" }, "temp-dir", 2.5);
    });
  });

  describe("cleanupDirectory", () => {
    it("should delete the targeted temp dir.", () => {
      cleanupDirectory("dir");
      expect(fs.rmSync).toBeCalledTimes(1);
      expect(fs.rmSync).toHaveBeenCalledWith(expect.stringMatching(RegExp(`${mockTemp}[/\\\\]dir`)), {
        recursive: true,
      });
    });
  });
});
