import { MediaData } from "../interfaces";
import { getFetchedData } from "./getFetchedData";

jest.mock("./getShotDuration", () => ({
  getShotDuration: jest.fn(() => 2000),
}));

describe("VideoCreator utils.getFetchedData", () => {
  let mediaData: MediaData;

  beforeEach(() => {
    mediaData = {
      sceneIdx: 0,
      image: "mock-image-url",
      music: "mock-music-url",
      sound: "mock-sound-url",
      previousImage: "image-url",
    } as MediaData;
  });

  it("should map the fetched data correctly", () => {
    const mockedImageFile = { filename: "mock-image-url", value: "mock-value" };
    const mockedMusicFile = { filename: "mock-music-url", value: "mock-value" };
    const mockedSoundFile = { filename: "mock-sound-url", value: "mock-value" };
    const res = getFetchedData(
      {
        "mock-image-url": mockedImageFile,
        "mock-music-url": mockedMusicFile,
        "mock-sound-url": mockedSoundFile,
      },
      [mediaData]
    );
    expect(res[0].image).toEqual(mockedImageFile);
    expect(res[0].music).toEqual(mockedMusicFile);
    expect(res[0].sound).toEqual(mockedSoundFile);
  });

  it("duration should be calculated correctly.", () => {
    const res = getFetchedData(
      { "mock-image-url": { value: "mock-value", filename: "mock-image-url", duration: 1000 } },
      [mediaData]
    );
    expect(res[0].duration).toEqual(2000);
  });

  it("startTime should be calculated correctly.", () => {
    const res = getFetchedData(
      { "mock-image-url": { value: "mock-value", filename: "mock-image-url", duration: 1000 } },
      [mediaData, mediaData]
    );
    expect(res[1].startingTime).toEqual(res[0].duration);
  });
});
