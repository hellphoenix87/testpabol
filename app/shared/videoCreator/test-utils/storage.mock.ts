export const fileDownload = jest.fn(() => ["mock-file-url"]);
export const fileSave = jest.fn();
export const fileExists = jest.fn(() => [true]);
export const mockedUpload = jest.fn();
export const mockedGetSignedUrl = jest.fn(() => ["mock-signed-url"]);

export const mockedFile = jest.fn((name?: string) => ({
  name: name || "mock-file-name",
  download: fileDownload,
  save: fileSave,
  exists: fileExists,
  getSignedUrl: mockedGetSignedUrl,
}));
export const mockedBucket = jest.fn((name: string) => ({
  name: name || "mock-bucket-name",
  file: jest.fn(fileName => mockedFile(fileName)),
  upload: mockedUpload,
  getFiles: jest.fn().mockImplementation(() => [[mockedFile("mock-file-1"), mockedFile("mock-file-2")]]),
}));

export const mockedStorage = {
  bucket: jest.fn(name => mockedBucket(name)),
};

export const mockedRef = jest.fn();
export const mockedGetDownloadURL = jest.fn();
export const mockedGetBytes = jest.fn();
export const mockedGetStorage = jest.fn();

jest.mock("@google-cloud/storage", () => ({
  Storage: jest.fn(() => mockedStorage),
}));

jest.mock("firebase/storage", () => ({
  ref: jest.fn(() => ({ bucket: "mocked-bucket-name" })),
  getDownloadURL: mockedGetDownloadURL,
  getBytes: mockedGetBytes,
  getStorage: mockedGetStorage,
}));
