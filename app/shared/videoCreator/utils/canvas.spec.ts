import { getCanvasHeight } from "./canvas";

describe("VideoCreator utils.canvas", () => {
  describe("getCanvasHeight", () => {
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
      mockCanvas = { width: 100 } as HTMLCanvasElement;
    });

    it("should return the correct height based on the canvas width", () => {
      const expectedHeight = (mockCanvas.width * 9) / 16;
      const result = getCanvasHeight(mockCanvas);

      expect(result).toBe(expectedHeight);
    });
  });
});
