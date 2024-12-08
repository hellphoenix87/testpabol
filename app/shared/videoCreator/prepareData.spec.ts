import { DEFAULT_OPTIONS } from "./constants";
import { Shot } from "./interfaces";
import { getMediaData, getRandomZoom } from "./prepareData";
import { sceneMockFactory } from "./test-utils";

const mockScene = sceneMockFactory();
const scenes = [mockScene, mockScene, mockScene];
describe("VideoCreator prepareData", () => {
  const data = { original: scenes, targeted: scenes };

  describe("getMediaData", () => {
    it("check black fade background", () => {
      const res = getMediaData(data, DEFAULT_OPTIONS);
      expect(res[0].hasBlackFading).toEqual(true);
      expect(res[res.length - 1].hasBlackFading).toEqual(true);
      expect(res[1].hasBlackFading).toEqual(false);
    });

    it("check the shots length", () => {
      const res = getMediaData(data, DEFAULT_OPTIONS);
      expect(res.length).toEqual(6);
    });

    it("check the urls", () => {
      const res = getMediaData(data, DEFAULT_OPTIONS);
      expect(res[0].image).toEqual(mockScene?.shots?.[0]?.image_url);
      expect(res[1].image).toEqual(mockScene?.shots?.[1]?.image_url);
      expect(res[0].music).toEqual(mockScene?.musics?.[0]?.id);
      expect(res[0].sound).toEqual(mockScene?.shots?.[0]?.sound_urls[mockScene?.shots?.[0]?.selected_sound_index]);
      expect(res[1].sound).toEqual(mockScene?.shots?.[1]?.sound_urls[mockScene?.shots?.[1]?.selected_sound_index]);
      expect(res[0].voice[0]).toEqual(mockScene?.shots?.[0]?.dialog[0].line_url);
      expect(res[1].voice[0]).toEqual(mockScene?.shots?.[1]?.dialog[0].line_url);
    });

    it("if empty shots passed throw error", () => {
      const mockScene = sceneMockFactory();
      mockScene.shots = [];
      const data = { targeted: [mockScene], original: scenes };
      expect(() => getMediaData(data, DEFAULT_OPTIONS)).toThrowError();
    });

    it("if any shot has broken image throw error", () => {
      const mockScene = sceneMockFactory();
      (mockScene.shots as Shot[])[0].image_url = "";
      const data = { targeted: [mockScene], original: scenes };
      expect(() => getMediaData(data, DEFAULT_OPTIONS)).toThrowError();
    });

    it("if any shot missing image throw error", () => {
      const mockScene = sceneMockFactory();
      (mockScene.shots as Shot[])[0].image_url = undefined as any;
      const data = { targeted: [mockScene], original: scenes };
      expect(() => getMediaData(data, DEFAULT_OPTIONS)).toThrowError();
    });
  });

  it("getRandomZoom", () => {
    const res = getRandomZoom(DEFAULT_OPTIONS);
    expect(res).toBeLessThan(1 + DEFAULT_OPTIONS.zoomIntensity);
    expect(res).toBeGreaterThan(1);
  });
});
