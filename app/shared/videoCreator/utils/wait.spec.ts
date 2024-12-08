import { wait } from "./wait";

describe("VideoCreator utils.wait", () => {
  beforeAll(() => {
    jest.spyOn(global, "setTimeout");
  });

  test("should call Promise", async () => {
    const delay = 1000;

    await wait(delay);

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), delay);
  });
});
