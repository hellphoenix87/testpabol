import { applyDynamicRangeCompression, applyEqualization } from "./ffmpeg";
import * as ffmpeg from "fluent-ffmpeg";
import { ffmpegMock } from "../tests-util/fluent-ffmpeg-mock";

jest.mock("fluent-ffmpeg");

describe("applyDynamicRangeCompression", () => {
  it("should apply dynamic range compression", async () => {
    const audioFile = "input-audio-file.ogg";
    const tempDir = "temp-directory";

    jest.spyOn(ffmpeg, "default").mockReturnValue(ffmpegMock as any);

    const result = await applyDynamicRangeCompression(audioFile, tempDir);

    expect(result).toContain(tempDir);
    expect(ffmpegMock.input).toHaveBeenCalledWith(audioFile);
    expect(ffmpegMock.audioFilters).toHaveBeenCalledWith(
      "compand=0|0:1|1:-90/-60|-60/-40|-40/-30|-20/-20:6:0:-90:0.2"
    );
    expect(ffmpegMock.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(ffmpegMock.save).toHaveBeenCalledWith(expect.stringMatching(/.*compressed\.ogg$/));
  });
});

describe("applyEqualization", () => {
  it("should apply equalization", async () => {
    const audioFile = "input-audio-file.ogg";
    const equalizationSettings = [
      { frequency: 100, gain: 3 },
      { frequency: 500, gain: 6 },
      { frequency: 1000, gain: -3 },
    ];
    const tempDir = "temp-directory";

    const filterString = equalizationSettings
      .map(setting => `equalizer=f=${setting.frequency}:g=${setting.gain}`)
      .join(",");

    jest.spyOn(ffmpeg, "default").mockReturnValue(ffmpegMock as any);

    const result = await applyEqualization(audioFile, equalizationSettings, tempDir);

    expect(result).toContain(tempDir);
    expect(ffmpegMock.input).toHaveBeenCalledWith(audioFile);
    expect(ffmpegMock.audioFilters).toHaveBeenCalledWith(filterString);
    expect(ffmpegMock.on).toHaveBeenCalledWith("end", expect.any(Function));
    expect(ffmpegMock.save).toHaveBeenCalledWith(expect.stringMatching(/.*equalized\.ogg$/));
  });
});
