import fs from "fs";
import os from "os";
import path from "path";

const tempDir = os?.tmpdir();

export const generateTempFileUrl = (name: string, directory?: string): string => {
  return path.join(tempDir, directory || "", name.replace(/[/\\]/g, "-"));
};

export const writeFile = (data: Buffer, name: string): string => {
  const url = path.join(tempDir, name);
  fs.writeFileSync(url, data);
  return url;
};

export const prepareDirectory = (name: string): string => {
  const url = path.join(tempDir, name);
  if (!fs.existsSync(url)) {
    fs.mkdirSync(url);
  }
  return url;
};

export const cleanup = (name: string): void => {
  const url = path.join(tempDir, name);
  fs.rmSync(url, { recursive: true });
};

export const renameFile = (oldName: string, newName: string): void => {
  fs.renameSync(oldName, newName);
};

export const getDirFiles = (directory: string): string[] => {
  return fs.readdirSync(directory);
};
