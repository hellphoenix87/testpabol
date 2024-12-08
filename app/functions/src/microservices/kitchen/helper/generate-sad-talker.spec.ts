const publishMock = jest.fn();
const isFileExistsMock = jest.fn(() => true);
const setCreationDataMock = jest.fn();

jest.mock("./pub-sub-invoker", () => ({
  __esModule: true,
  PubSubService: jest.fn().mockImplementation(() => ({
    publish: publishMock,
  })),
}));
jest.mock("../../../utils/storage", () => ({
  isFileExists: isFileExistsMock,
}));
jest.mock("../../../DB/creationRepository", () => ({
  setCreationData: setCreationDataMock,
}));

import { sceneMockFactory } from "../../../test-utils/scene.mock";
import { Scene } from "../../../schema/Scene.schema";
import { ShotDuration } from "../../../../../shared";
import { generateSadTalkerVideos } from "./generate-sad-talker";

describe("generate-sad-talker", () => {
  let scenes: Scene[];
  const uid = "mock-uid";
  const creationId = "mock-cid";
  const mockedDuration: ShotDuration = { sceneIdx: 0, shotIdx: 0, duration: 5000, dialog: [1800] };
  beforeEach(() => {
    scenes = [sceneMockFactory()];
    process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE = "bucket-name";
  });

  it("should not send messages or generate data if media bucket not defined", async () => {
    process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE = "";
    await generateSadTalkerVideos({ scenes, uid, creationId, durations: [mockedDuration], animatedShots: {} });
    expect(publishMock).toHaveBeenCalledTimes(0);
  });

  it("should not send messages if the generated data has no valid image to animate", async () => {
    const scenesWithoutBBox = scenes.map(scene => ({
      ...scene,
      shots: scene.shots?.map(shot => ({ ...shot, bounding_boxes: [] })),
    }));
    await generateSadTalkerVideos({
      scenes: scenesWithoutBBox,
      uid,
      creationId,
      durations: [mockedDuration],
      animatedShots: {},
    });
    expect(publishMock).toHaveBeenCalledTimes(0);
  });

  it("should not send messages if all shots has no dialogs", async () => {
    const scenesWithoutDialogs = scenes.map(scene => ({
      ...scene,
      shots: scene.shots?.map(shot => ({ ...shot, dialog: [] })),
    }));
    await generateSadTalkerVideos({
      scenes: scenesWithoutDialogs,
      uid,
      creationId,
      durations: [mockedDuration],
      animatedShots: {},
    });
    expect(publishMock).toHaveBeenCalledTimes(0);
  });

  it("should not send messages if all shots already have video urls", async () => {
    const scenesWithVideos = scenes.map(scene => ({
      ...scene,
      shots: scene.shots?.map(shot => ({ ...shot, video_url: "mock-video-url" })),
    }));
    await generateSadTalkerVideos({
      scenes: scenesWithVideos,
      uid,
      creationId,
      durations: [mockedDuration],
      animatedShots: {},
    });
    expect(publishMock).toHaveBeenCalledTimes(0);
  });

  it("should send pub/sub message", async () => {
    await generateSadTalkerVideos({
      scenes,
      uid,
      creationId,
      durations: [mockedDuration, mockedDuration],
      animatedShots: {},
    });
    const bucket = process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE;
    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(publishMock).toHaveBeenCalledWith(
      {
        dataframe_records: [
          {
            duration: mockedDuration.duration,
            bounding_boxes: scenes[0].shots?.[0].bounding_boxes,
            data_bucket: bucket,
            image_url: scenes[0].shots?.[0].image_url,
            output_path: scenes[0].shots?.[0].image_url,
            speech_data: scenes[0].shots?.[0].dialog.map((d, i) => ({
              character_id: d.character_id,
              line_url: d.line_url,
              start_at: mockedDuration.dialog[i],
            })),
          },
        ],
      },
      {
        creation_id: "mock-cid",
        scene_id: "mock-scene-id",
        shot_id: "mock-shot-id-1",
        shot_index: "0",
        user_id: "mock-uid",
      }
    );
    expect(setCreationDataMock).toHaveBeenCalledTimes(1);
  });
});
