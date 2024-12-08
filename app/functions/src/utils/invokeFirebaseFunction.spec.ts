import axios from "axios";
import { FunctionNames, invokeFirebaseFunction } from "./invokeFirebaseFunction";

jest.mock("axios");
jest.mock("firebase-functions");

describe("invokeFirebaseFunction", () => {
  it("should build emulator url", async () => {
    axios.post = jest.fn().mockResolvedValue({ data: "mock-emulator-result" });
    process.env.FUNCTIONS_EMULATOR = "true";
    const res = await invokeFirebaseFunction(FunctionNames.bakeVideo, {
      body: { prop: "mocked body prop" },
      headers: { prop: "mocked_header_prop" },
    });
    expect(res).toEqual("mock-emulator-result");
    expect(axios.post).toHaveBeenCalledWith(
      `http://127.0.0.1:5001/${process.env.PABOLO_PROJECT_ID}/${process.env.PABOLO_FUNCTIONS_REGION}/R${process.env.__COMMIT_HASH__}_kitchen/bakeVideo`,
      { prop: "mocked body prop" },
      { headers: { "Content-Type": "application/json", prop: "mocked_header_prop" }, timeout: 3600_000 }
    );
  });

  it("should build deployed url", async () => {
    axios.post = jest.fn().mockResolvedValue({ data: "mock-deployed-result" });
    process.env.FUNCTIONS_EMULATOR = "false";
    const res = await invokeFirebaseFunction(FunctionNames.bakeVideo, {
      body: { prop: "mocked body prop" },
      headers: { prop: "mocked_header_prop" },
    });
    expect(res).toEqual("mock-deployed-result");
    expect(axios.post).toHaveBeenCalledWith(
      `https://${process.env.PABOLO_FUNCTIONS_REGION}-${process.env.PABOLO_PROJECT_ID}.cloudfunctions.net/R${process.env.__COMMIT_HASH__}_kitchen/bakeVideo`,
      { prop: "mocked body prop" },
      { headers: { "Content-Type": "application/json", prop: "mocked_header_prop" }, timeout: 3600_000 }
    );
  });

  it("should keep retrying until retry is 0, if axios request fail.", async () => {
    jest.restoreAllMocks();
    axios.post = jest.fn().mockImplementationOnce(() => {
      throw new Error();
    });
    await invokeFirebaseFunction(FunctionNames.bakeVideo, {
      body: { prop: "mocked body prop" },
      headers: { prop: "mocked_header_prop" },
      retry: 2,
    });
    expect(axios.post).toHaveBeenCalledTimes(2);
  });
});
