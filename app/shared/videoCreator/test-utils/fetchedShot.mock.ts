import { FetchedShot } from "../interfaces";

export const fetchedShotMockFactory = (updateMock?: any): FetchedShot => {
  return {
    duration: 2_000,
    image: { value: "mock-image-value", filename: "mock-file-name" },
    sound: { value: "mock-image-value", filename: "mock-file-name" },
    voice: [{ value: "mock-image-value", filename: "mock-file-name" }],
    music: { value: "mock-image-value", filename: "mock-file-name" },
    sceneIdx: 0,
    shotIdx: 0,
    fadeIn: 0,
    fadeOut: 0,
    zoomStart: 1.01,
    zoomEnd: 1.03,
    hasBlackFading: false,
    acousticEnv: "hall",
    ...updateMock,
  };
};
