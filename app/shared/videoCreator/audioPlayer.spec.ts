import {
  AudioContext as context,
  AudioBuffer as buffer,
  AudioBufferSourceNode,
} from "standardized-audio-context-mock";
global.AudioContext = context as any;
global.AudioBuffer = buffer as any;

import { getPlayingSource, play, stopAll, stop } from "./audioPlayer";

describe("VideoCreator audioPlayer", () => {
  describe("getPlayingSource", () => {
    it("should return the source file for the targeted buffer", () => {
      const audio = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio, type: "MUSIC" });
      expect(getPlayingSource(audio)).toBeInstanceOf(AudioBufferSourceNode);
      stopAll();
    });
  });

  describe("play", () => {
    it("source files should be added to the current playing sources map", () => {
      const audio1 = new AudioBuffer({ length: 1, sampleRate: 1 });
      const audio2 = new AudioBuffer({ length: 2, sampleRate: 2 });
      play({ audio: audio1, type: "MUSIC" });
      play({ audio: audio2, type: "MUSIC" });
      expect(getPlayingSource(audio1)).toBeInstanceOf(AudioBufferSourceNode);
      expect(getPlayingSource(audio2)).toBeInstanceOf(AudioBufferSourceNode);
      stopAll();
    });
    it("should apply loop functionality", () => {
      const audio = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio, loop: true, type: "MUSIC" });
      const source = getPlayingSource(audio);
      expect(source?.loop).toEqual(true);
      expect(source?.buffer).toEqual(audio);
    });

    it("should disable loop functionality", () => {
      const audio = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio, loop: false, type: "MUSIC" });
      const source = getPlayingSource(audio);
      expect(source?.loop).toEqual(false);
      expect(source?.buffer).toEqual(audio);
    });
    it("should close the old context", () => {
      const audio1 = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio: audio1, type: "MUSIC" });
      const source1 = getPlayingSource(audio1);
      stop(audio1);
      expect(source1?.context.state).toEqual("suspended");
    });
    it("should use different context for different audio types", () => {
      const audio1 = new AudioBuffer({ length: 1, sampleRate: 1 });
      const audio2 = new AudioBuffer({ length: 2, sampleRate: 2 });
      play({ audio: audio1, type: "MUSIC" });
      const source1 = getPlayingSource(audio1);
      stop(audio1);
      play({ audio: audio2, type: "DIALOG" });
      const source2 = getPlayingSource(audio2);
      expect(source1?.context).not.toEqual(source2?.context);
    });
  });

  describe("stop", () => {
    it("should clear only the targeted source file", () => {
      const audio1 = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio: audio1, type: "MUSIC" });
      const audio2 = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio: audio2, type: "MUSIC" });
      stop(audio1);
      expect(getPlayingSource(audio1)).toEqual(undefined);
      expect(getPlayingSource(audio2)).toBeInstanceOf(AudioBufferSourceNode);
      stopAll();
    });
  });

  describe("stopAll", () => {
    it("should clear all the source files", () => {
      const audio1 = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio: audio1, type: "MUSIC" });
      const audio2 = new AudioBuffer({ length: 1, sampleRate: 1 });
      play({ audio: audio2, type: "MUSIC" });
      stopAll();
      expect(getPlayingSource(audio1)).toEqual(undefined);
      expect(getPlayingSource(audio2)).toEqual(undefined);
    });
  });
});
