import { DEFAULT_OPTIONS } from "../constants";
import { MediaData } from "../interfaces";
import { getMediaData } from "../prepareData";
import { sceneMockFactory } from "../test-utils";
import { getShotDuration } from "./getShotDuration";

describe("VideoCreator utils.getShotDuration", () => {
  let scenesData: MediaData[];

  beforeEach(() => {
    scenesData = getMediaData({ original: [sceneMockFactory()], targeted: [sceneMockFactory()] }, DEFAULT_OPTIONS);
  });

  it("should return the default duration if no voice exist", () => {
    const mediaData = scenesData[0];
    mediaData.voice = [];
    expect(getShotDuration(mediaData, {})).toEqual(mediaData.duration);
  });

  it("should return the calculated duration for all voices", () => {
    const mediaData = scenesData[0];
    mediaData.voice = ["mock-dialog-url"];
    const result = getShotDuration(mediaData, {
      "mock-dialog-url": { filename: "mock-dialog-url", value: "test2", duration: 2 },
    });

    expect(result).toEqual(4000);
  });
});
