import fs from "fs";
import os from "os";
import path from "path";

jest.mock("os");
jest.mock("fs");
const mockTemp = "mock-temp-url";

jest.spyOn(os, "tmpdir").mockReturnValue(mockTemp);
import { cleanup, generateTempFileUrl, prepareDirectory, writeFile } from "./fileControl";

describe("VideoCreator utils.fileControl", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("generateTempFileUrl", () => {
    it("should generate a file usl for the targeted file.", () => {
      const expectedUrl = path.join(mockTemp, "directory", "name");
      expect(generateTempFileUrl("name", "directory")).toEqual(expectedUrl);
    });
  });

  describe("writeFile", () => {
    it("should call the fs to write the file.", () => {
      writeFile(Buffer.from("test"), "test-file");
      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    });
  });
  describe("prepareDirectory", () => {
    it("should call fs to make directory if it does not exist", () => {
      jest.spyOn(fs, "existsSync").mockReturnValue(true);
      prepareDirectory("dir");
      expect(fs.mkdirSync).toHaveBeenCalledTimes(0);
      jest.spyOn(fs, "existsSync").mockReturnValue(false);
      prepareDirectory("dir");
      expect(fs.mkdirSync).toHaveBeenCalledTimes(1);
    });
  });
  describe("cleanup", () => {
    it("delete the targeted temp dir.", () => {
      const expectedUrl = path.join(mockTemp, "dir");

      cleanup("dir");
      expect(fs.rmSync).toHaveBeenCalledTimes(1);
      expect(fs.rmSync).toHaveBeenCalledWith(expectedUrl, { recursive: true });
    });
  });
});
