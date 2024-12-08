import { Timer } from "./timer";
import { fetchedShotMockFactory } from "./test-utils";
import { wait } from "./utils";

describe("VideoCreator timer", () => {
  const shots = [fetchedShotMockFactory(), fetchedShotMockFactory()];
  let timerInstance: Timer;
  const playScenesHandler = jest.fn();
  const stopScenesHandler = jest.fn();
  const prepareShotHandler = jest.fn();
  const timerEventFunction = jest.fn();

  beforeEach(() => {
    timerInstance = new Timer(shots, playScenesHandler, stopScenesHandler, prepareShotHandler, timerEventFunction);
  });

  it("should play the timer", () => {
    timerInstance.play();
    expect(playScenesHandler).toBeCalled();
    expect(timerInstance.isPlaying).toEqual(true);
    expect(timerInstance.timeProperties.shotIndex).toEqual(0);
  });

  it("should auto navigate to the next shot", async () => {
    timerInstance.play();
    expect(timerInstance.timeProperties.shotIndex).toEqual(0);
    await wait(3000);
    expect(timerInstance.timeProperties.shotIndex).toEqual(1);
  });

  it("should navigate to the next shot", () => {
    timerInstance.play();
    expect(timerInstance.timeProperties.shotIndex).toEqual(0);
    timerInstance.nextShot();
    expect(timerInstance.timeProperties.shotIndex).toEqual(1);
  });

  it("should stop if no new shot to play.", () => {
    jest.spyOn(timerInstance, "stop");
    timerInstance.play();
    expect(timerInstance.timeProperties.shotIndex).toEqual(0);
    timerInstance.nextShot();
    timerInstance.nextShot();
    expect(timerInstance.stop).toBeCalled();
  });

  it("should navigate to the previous shot", () => {
    timerInstance.play();
    timerInstance.nextShot();
    expect(timerInstance.timeProperties.shotIndex).toEqual(1);
    timerInstance.previousShot();
    expect(timerInstance.timeProperties.shotIndex).toEqual(0);
  });

  it("should go to custom shot", () => {
    timerInstance.play();
    timerInstance.goToShot(1);
    expect(timerInstance.timeProperties.shotIndex).toEqual(1);
  });

  it("should stop the timer", () => {
    timerInstance.play();
    timerInstance.stop();
    expect(timerInstance.isPlaying).toEqual(false);
  });
});
