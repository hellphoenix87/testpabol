import { firestoreAdmin, getSpy } from "../../test-utils/firebase-mock";
import { sceneMockFactory } from "../../test-utils/scene.mock";
import axios from "axios";

const DEFAULT_ANIMATED_SHOTS = { isGenerated: true, duration: 10, video_url: "videoURL" };

const getScenesListData = jest.fn();
const validateGCPToken = jest.fn();
const generateSadTalkerVideos = jest.fn(({ scenes }) => scenes);
const generateToken = jest.fn(() => "Token");
const getAnimatedShotsStatus = jest.fn(
  () =>
    ({
      all: DEFAULT_ANIMATED_SHOTS,
    }) as AnimatedShots
);
const setAnimatedShotsStatus = jest.fn();
const setShotData = jest.fn();

const mockedCreator = {
  generate: jest.fn(),
  createFile: jest.fn(),
  mergeVideos: jest.fn(() => ({ duration: 10, url: "mock-url" })),
  getShotsDuration: jest.fn(() => []),
  getElapsedTime: jest.fn(() => ({
    merging: 1000,
    scenes: [200, 500, 300],
  })),
};

jest.mock("./helper/generate-sad-talker", () => ({ generateSadTalkerVideos }));
jest.mock("../../DB/creationRepository", () => ({
  getScenesListData,
  getAnimatedShotsStatus,
  setAnimatedShotsStatus,
  setShotData,
}));
jest.mock("../../utils/googleAuth", () => ({ validateGCPToken, generateToken }));
jest.mock("../../modules/creations/controllers/createNewVideoRecord", () => ({ createNewVideoRecord: jest.fn() }));
jest.mock("../../../../shared", () => ({
  VideoCreator: jest.fn().mockImplementation(() => mockedCreator),
}));
jest.mock("axios");

jest.mock("firebase-functions/logger", () => ({
  error: jest.fn(),
  log: jest.fn(),
}));

import { animateVideoPart, bakeVideo, cookVideo } from "./endpoints";
import { FunctionNames, buildUrl } from "../../utils/invokeFirebaseFunction";
import { AnimatedShots } from "../../schema/CreationMeta.schema";

jest.mock("firebase-admin", () => firestoreAdmin);

const mockedUser = { uid: "0123456789012345678901234567", email: "mock-mail@pabolo.ai" };
const mockedBody = { creationId: "mock-creation-id" };

const mockReq = ({ user, body }: { user?: any; body?: any }) => {
  return {
    user: user || mockedUser,
    body: body || mockedBody,
    headers: {
      host: "127.0.0.1",
      authorization: "mock-authorization",
    },
  };
};

const mockRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn().mockImplementation(res => res),
    send: jest.fn().mockImplementation(res => res),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe("bakeVideo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw unauthorized error if user uid not valid", async () => {
    const mockedReq: any = mockReq({ user: { uid: null } });
    const mockedRes: any = mockRes();
    const res = await bakeVideo(mockedReq, mockedRes);
    expect(res).toEqual({ error: "Unauthorized" });
  });
  it("the creator should called with the scenes data", async () => {
    const mockedReq: any = mockReq({});
    const mockedRes: any = mockRes();
    const scene = sceneMockFactory();
    getScenesListData.mockImplementationOnce(() => [scene]);
    await bakeVideo(mockedReq, mockedRes);
    expect(mockedCreator.generate).toHaveBeenCalledWith([scene], undefined);
  });
  it("the creator should called with the scenes data and specific part", async () => {
    const mockedReq: any = mockReq({ body: { creationId: "123", part: 0 } });
    const mockedRes: any = mockRes();
    const scene = sceneMockFactory();
    getScenesListData.mockImplementationOnce(() => [scene]);
    await bakeVideo(mockedReq, mockedRes);
    expect(mockedCreator.generate).toHaveBeenCalledWith([scene], 0);
  });

  it("should call validate token and throw unauthorized if it is not valid service account", async () => {
    const mockedReq: any = mockReq({ user: { uid: null } });
    const mockedRes: any = mockRes();
    validateGCPToken.mockResolvedValue(false);
    const res = await bakeVideo(mockedReq, mockedRes);
    expect(validateGCPToken).toHaveBeenCalled();
    expect(res).toEqual({ error: "Unauthorized" });
  });

  it("should call validate token and pass if it is a valid service account", async () => {
    const mockedReq: any = mockReq({ user: { uid: null }, body: { ...mockedBody, uid: "mocked-uid", isMock: true } });
    const mockedRes: any = mockRes();
    validateGCPToken.mockResolvedValue(true);
    const scene = sceneMockFactory();
    getScenesListData.mockImplementationOnce(() => [scene, scene, scene]);
    await bakeVideo(mockedReq, mockedRes);

    expect(validateGCPToken).toHaveBeenCalled();
    expect(mockedCreator.generate).toHaveBeenCalledWith([scene, scene, scene], undefined);
  });
});

describe("cookVideo", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw unauthorized error if user uid not valid", async () => {
    const mockedReq: any = mockReq({ user: { uid: null, isMock: true } });
    const mockedRes: any = mockRes();
    const res = await cookVideo(mockedReq, mockedRes);
    expect(res).toEqual({ error: "Unauthorized" });
  });

  it("should regenerate not existing video should throw not found error", async () => {
    const mockedReq: any = mockReq({ body: { regenerate: true, creationId: "123", isMock: true } });
    const mockedRes: any = mockRes();
    const scene = sceneMockFactory();
    getScenesListData.mockImplementationOnce(() => [scene, scene, scene]);
    getSpy.mockResolvedValueOnce({ data: () => null, exists: false } as any);
    const res = await cookVideo(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Video does not exist",
      error: "Video does not exist",
      statusCode: 404,
    });
  });

  it("should regenerate failed video should throw error", async () => {
    const mockedReq: any = mockReq({ body: { regenerate: true, creationId: "123", isMock: true } });
    const mockedRes: any = mockRes();
    const scene = sceneMockFactory();
    getScenesListData.mockImplementationOnce(() => [scene, scene, scene]);
    getSpy.mockResolvedValueOnce({ data: () => ({ status: "Succeeded" }), exists: true } as any);
    const res = await cookVideo(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Video is not in failed status, you cannot regenerate it",
      error: "Video is not in failed status, you cannot regenerate it",
      statusCode: 400,
    });
  });

  it("axios need to be called with with the same number of scenes", async () => {
    const mockedReq: any = mockReq({ body: { creationId: "mock-creation-id", isMock: true } });
    const mockedRes: any = mockRes();
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    const scene = sceneMockFactory();
    const scenes = [scene, scene, scene];
    getScenesListData.mockImplementationOnce(() => scenes);
    await cookVideo(mockedReq, mockedRes);
    expect(axios.post).toHaveBeenCalledTimes(3);
  });

  it("should call sadTalker if isMock is false", async () => {
    const animatedShots = {
      scene_1: { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
      all: { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
    };
    const mockedReq: any = mockReq({ body: { creationId: "mock-creation-id", test: 1, isMock: false } });
    getAnimatedShotsStatus.mockImplementationOnce(() => animatedShots);
    const mockedRes: any = mockRes();
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    const scene = sceneMockFactory();
    const scenes = [scene, scene, scene];
    getScenesListData.mockImplementationOnce(() => scenes);
    await cookVideo(mockedReq, mockedRes);
    expect(generateSadTalkerVideos).toHaveBeenCalledWith({
      scenes,
      animatedShots,
      uid: "0123456789012345678901234567",
      creationId: "mock-creation-id",
      durations: [],
    });
  });

  it("should merge videos should be called after finalizing everything", async () => {
    const mockedReq: any = mockReq({ body: { isMock: true } });
    const mockedRes: any = mockRes();
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    const scene = sceneMockFactory();
    const scenes = [scene, scene, scene];
    getScenesListData.mockImplementationOnce(() => scenes);
    const res = await cookVideo(mockedReq, mockedRes);
    expect(mockedCreator.mergeVideos).toHaveBeenCalled();
    expect(res).toEqual({
      duration: 10,
      status: "READY",
      url: "mock-url",
    });
  });

  it("should call validate token and throw unauthorized if it is not valid service account", async () => {
    const mockedReq: any = mockReq({ user: { uid: null, isMock: true } });
    const mockedRes: any = mockRes();
    validateGCPToken.mockResolvedValue(false);
    const res = await cookVideo(mockedReq, mockedRes);
    expect(validateGCPToken).toBeCalled();
    expect(res).toEqual({ error: "Unauthorized" });
  });

  it("should call validate token and pass if it is a valid service account", async () => {
    const mockedReq: any = mockReq({ user: { uid: null }, body: { ...mockedBody, uid: "mocked-uid", isMock: true } });
    const mockedRes: any = mockRes();
    validateGCPToken.mockResolvedValue(true);
    const scene = sceneMockFactory();
    const scenes = [scene, scene, scene];
    getScenesListData.mockImplementationOnce(() => scenes);
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    const res = await cookVideo(mockedReq, mockedRes);

    expect(validateGCPToken).toHaveBeenCalled();
    expect(res).toEqual({
      duration: 10,
      status: "READY",
      url: "mock-url",
    });
  });

  it("should not call sadTalker for mock mode", async () => {
    const mockedReq: any = mockReq({ body: { ...mockedBody, isMock: true } });
    const mockedRes: any = mockRes();
    validateGCPToken.mockResolvedValue(true);
    const scene = sceneMockFactory();
    const scenes = [scene, scene, scene];
    getScenesListData.mockImplementationOnce(() => scenes);
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    await cookVideo(mockedReq, mockedRes);

    expect(generateSadTalkerVideos).not.toHaveBeenCalled();
  });
});

describe("animateVideoPart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the status and do not update the shot with video url if video creation failed", async () => {
    const creation_id = "creationId";
    const user_id = "userId";
    const scene_id = "scene_id";
    const shot_id = "0";
    const shot_index = "0";
    const key = `scene_${scene_id}_shot_${shot_id}`;
    getAnimatedShotsStatus.mockImplementationOnce(() => ({
      [key]: { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
      "another-exist-key": { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
    }));
    await animateVideoPart({
      data: { response_status_code: 400 },
      attributes: {
        creation_id,
        user_id,
        scene_id,
        shot_id,
        shot_index,
      },
    });
    expect(getAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id);
    expect(setAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id, key);
    expect(setShotData).not.toHaveBeenCalled();
  });

  it("should update the status and update the shot with video url if video creation succeeded", async () => {
    const creation_id = "creationId";
    const user_id = "userId";
    const scene_id = "scene_id";
    const shot_id = "0";
    const shot_index = "0";
    const key = `scene_${scene_id}_shot_${shot_id}`;
    getAnimatedShotsStatus.mockImplementationOnce(() => ({
      [key]: { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
      "another-exist-key": { ...DEFAULT_ANIMATED_SHOTS, isGenerated: false },
    }));
    await animateVideoPart({
      data: { response_status_code: 200 },
      attributes: {
        creation_id,
        user_id,
        scene_id,
        shot_id,
        shot_index,
      },
    });
    expect(getAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id);
    expect(setAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id, key);
    expect(setShotData).toHaveBeenCalledTimes(1);
  });

  it("if all shots are done call the cook and set the all flag to true", async () => {
    const creation_id = "creationId";
    const user_id = "userId";
    const scene_id = "scene_id";
    const shot_id = "0";
    const shot_index = "0";
    const key = `scene_${scene_id}_shot_${shot_id}`;
    getAnimatedShotsStatus.mockImplementationOnce(() => ({
      [key]: { ...DEFAULT_ANIMATED_SHOTS, isGenerated: true },
      "another-exist-key": { ...DEFAULT_ANIMATED_SHOTS, isGenerated: true },
    }));
    jest.spyOn(axios, "post").mockResolvedValue({ success: true });
    await animateVideoPart({
      data: { response_status_code: 200 },
      attributes: {
        creation_id,
        user_id,
        scene_id,
        shot_index,
        shot_id,
      },
    });
    expect(getAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id);
    expect(setAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id, key);
    expect(setAnimatedShotsStatus).toHaveBeenCalledWith(user_id, creation_id, "all");
    expect(setShotData).toHaveBeenCalledTimes(1);
    expect(generateToken).toHaveBeenCalledWith(buildUrl(FunctionNames.cookVideo));
    expect(axios.post).toHaveBeenCalledWith(
      buildUrl(FunctionNames.cookVideo),
      { data: { creationId: "creationId", uid: "userId" } },
      {
        headers: { "Content-Type": "application/json", "x-authorization": "Token" },
        timeout: 3600000,
      }
    );
  });
});
