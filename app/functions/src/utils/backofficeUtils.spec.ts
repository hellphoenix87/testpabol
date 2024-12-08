import { buildVideoUrl } from "./backofficeUtils";

describe("test backofficeUtils functions", () => {
  describe("buildVideoUrl", () => {
    it("should return pabolo.ai url for production", () => {
      process.env.PABOLO_PROJECT_ID = "pabolo-prod";
      const result = buildVideoUrl("video123");
      expect(result).toBe("https://pabolo.ai/video/video123");
    });

    it("should return hosting url for non production", () => {
      process.env.PABOLO_PROJECT_ID = "pabolo-dev";
      const result = buildVideoUrl("video123");
      expect(result).toBe("https://pabolo-dev.web.app/video/video123");
    });

    it("should return pabolo.ai url if project id is not specified", () => {
      process.env.PABOLO_PROJECT_ID = "";
      const result = buildVideoUrl("video123");
      expect(result).toBe("https://pabolo.ai/video/video123");
    });
  });
});
