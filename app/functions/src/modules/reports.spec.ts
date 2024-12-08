import { firestoreAdmin } from "../test-utils/firebase-mock";
import { saveVideoReport } from "./reports";

jest.mock("firebase-admin", () => firestoreAdmin);
jest.mock("firebase-functions/logger");

const mockedUser = { uid: "0123456789012345678901234567", email: "mock-mail@pabolo.ai" };
const mockedVideo = { videoId: "123", description: "mocked-video-description" };

const mockReq = ({ user, body }: { user?: any; body: any }) => {
  return {
    user: user || mockedUser,
    body,
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

describe("saveVideoReport", () => {
  it("should return saved successfully response", async () => {
    const mockedReq: any = mockReq({ body: mockedVideo });
    const mockedRes: any = mockRes();
    const res = await saveVideoReport(mockedReq, mockedRes);
    expect(res).toEqual({ message: "Video report saved successfully." });
  });
  it("throw bad request error if description not valid", async () => {
    const mockedReq: any = mockReq({ body: { ...mockedVideo, description: "" } });
    const mockedRes: any = mockRes();
    const res: any = await saveVideoReport(mockedReq, mockedRes);
    expect(res.error.message).toEqual('"description" is not allowed to be empty');
    expect(res.statusCode).toEqual(400);
  });
  it("throw bad request error if videoId not passed", async () => {
    const mockedReq: any = mockReq({ body: { ...mockedVideo, videoId: undefined } });
    const mockedRes: any = mockRes();
    const res: any = await saveVideoReport(mockedReq, mockedRes);
    expect(res.error.message).toEqual('"videoId" is required');
    expect(res.statusCode).toEqual(400);
  });
});
