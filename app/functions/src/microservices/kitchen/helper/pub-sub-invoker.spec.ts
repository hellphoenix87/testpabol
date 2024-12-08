const mockPublish = jest.fn();
const mockGet = jest.fn();
const mockSubscriptionHandler = jest.fn();

const mockTopic = jest.fn().mockImplementation(() => ({
  get: mockGet,
  publishMessage: mockPublish,
  subscription: jest.fn().mockImplementation(() => ({
    on: mockSubscriptionHandler,
  })),
}));

jest.mock("@google-cloud/pubsub", () => ({
  __esModule: true,
  PubSub: jest.fn().mockImplementation(() => ({
    topic: mockTopic,
  })),
}));
jest.mock("../endpoints", () => ({
  animateVideoPart: jest.fn(),
}));

import { SadTalkerRequestMockFactory } from "../../../test-utils/sadtalker-request.mock";
import { PubSubMessage, PubSubService } from "./pub-sub-invoker";

describe("PubSubService", () => {
  let pubSubService: PubSubService;
  let pubSubRequestMock: PubSubMessage;

  beforeAll(() => {
    process.env.FUNCTIONS_EMULATOR = "false";
    pubSubService = new PubSubService();
    pubSubRequestMock = { dataframe_records: [SadTalkerRequestMockFactory()] };
  });

  it("should initiate the topic subscription in the emulator", () => {
    process.env.FUNCTIONS_EMULATOR = "true";
    new PubSubService();
    expect(mockSubscriptionHandler).toHaveBeenCalledTimes(1);
  });

  it("should init the topic if not created yet", async () => {
    mockPublish.mockResolvedValue({ message: "message-id" });
    await pubSubService.publish(pubSubRequestMock);
    expect(mockTopic).toHaveBeenCalledTimes(3);
    expect(mockPublish).toHaveBeenCalledTimes(1);
  });

  it("should try more 20 times before failing", async () => {
    mockPublish.mockClear();
    mockPublish.mockImplementation(() => {
      throw new Error();
    });
    await expect(pubSubService.publish(pubSubRequestMock)).rejects.toThrow(Error);
    expect(mockPublish).toHaveBeenCalledTimes(21);
  });

  it("should send correct passed message", async () => {
    mockPublish.mockResolvedValue({ message: "message-id" });
    await pubSubService.publish(pubSubRequestMock);
    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        json: pubSubRequestMock,
      })
    );
  });
});
