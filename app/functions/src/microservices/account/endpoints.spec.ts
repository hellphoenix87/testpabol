const mockedImportedUtil = { getRandomAvatarImage: jest.fn() };

import { firestoreAdmin, getSpy } from "../../test-utils/firebase-mock";
import { getRandomAvatarImageUrl, getUserProfile, saveUserProfile } from "./endpoints";

jest.mock("firebase-admin", () => firestoreAdmin);

jest.mock("firebase-functions/v1", () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock("../../utils/utils", () => mockedImportedUtil);

const mockedUser = { uid: "0123456789012345678901234567", email: "mock-mail@pabolo.ai" };

const mockReq = ({ user, body }: { user?: any; body?: any }) => {
  return {
    user: user || mockedUser,
    body: body || mockedUser,
  };
};

const mockRes = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn().mockImplementation(res => res),
  };
  res.status.mockReturnValue(res);
  return res;
};

describe("saveUserProfile", () => {
  it("should return saved successfully response", async () => {
    const mockedReq: any = mockReq({});
    const mockedRes: any = mockRes();
    const res = await saveUserProfile(mockedReq, mockedRes);
    expect(res).toEqual({ message: "User profile successfully saved" });
  });

  it("throw bad request error if user uid not valid", async () => {
    const mockedReq: any = mockReq({ user: { uid: null } });
    const mockedRes: any = mockRes();
    const res = await saveUserProfile(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Invalid User!",
      error: "Invalid User!",
      statusCode: 400,
    });
  });
  it("throw bad request error while updating another user profile", async () => {
    const mockedReq: any = mockReq({ body: { uid: "0123456789012345678901234568", email: mockedUser.email } });
    const mockedRes: any = mockRes();
    const res = await saveUserProfile(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Attempt to save profile of another user.",
      error: "Attempt to save profile of another user.",
      statusCode: 405,
    });
  });
  it("throw bad request error for bad email format", async () => {
    const mockedReq: any = mockReq({ body: { uid: mockedUser.uid, email: "wrong-format" } });
    const mockedRes: any = mockRes();
    const res = await saveUserProfile(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Invalid email!",
      error: "Invalid email!",
      statusCode: 400,
    });
  });
  it("throw bad request if the type is not correct", async () => {
    const mockedReq: any = mockReq({ body: { uid: mockedUser.uid, email: mockedUser.email, display_name: false } });
    const mockedRes: any = mockRes();
    const res: any = await saveUserProfile(mockedReq, mockedRes);
    expect(res.error.message).toEqual('"display_name" must be a string');
  });
});

describe("getUserProfile", () => {
  it("should return saved successfully response", async () => {
    const mockedReq: any = mockReq({});
    const mockedRes: any = mockRes();
    const mockedUser = "mocked used";
    getSpy.mockResolvedValueOnce({ data: () => mockedUser, exists: true } as any);
    const res = await getUserProfile(mockedReq, mockedRes);
    expect(getSpy).toBeCalled();
    expect(res).toEqual(mockedUser);
  });

  it("throw 404 if the user not exist", async () => {
    const mockedReq: any = mockReq({});
    const mockedRes: any = mockRes();
    getSpy.mockResolvedValueOnce({ data: () => null, exists: false } as any);
    const res = await getUserProfile(mockedReq, mockedRes);
    expect(getSpy).toBeCalled();
    expect(res).toEqual({
      error: "Not Found",
      message: "Not Found",
      statusCode: 404,
    });
  });

  it("throw bad request error if user uid not valid", async () => {
    const mockedReq: any = mockReq({ body: { uid: null } });
    const mockedRes: any = mockRes();
    const res = await getUserProfile(mockedReq, mockedRes);
    expect(res).toEqual({
      message: "Invalid UID!",
      error: "Invalid UID!",
      statusCode: 400,
    });
  });
});

describe("getRandomAvatarImageUrl", () => {
  it("should return saved successfully response", async () => {
    const mockedReq: any = mockReq({});
    const mockedRes: any = mockRes();
    mockedImportedUtil.getRandomAvatarImage.mockResolvedValueOnce("mocked-url");
    const res = await getRandomAvatarImageUrl(mockedReq, mockedRes);
    expect(res).toEqual({ url: "mocked-url" });
  });
});
