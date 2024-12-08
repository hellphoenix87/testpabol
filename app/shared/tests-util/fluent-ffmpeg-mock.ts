export const ffmpegMock = {
  input: jest.fn().mockReturnThis(),
  inputFormat: jest.fn().mockReturnThis(),
  output: jest.fn().mockReturnThis(),
  outputFormat: jest.fn().mockReturnThis(),
  addInput: jest.fn().mockReturnThis(),
  addInputOption: jest.fn().mockReturnThis(),
  addOutput: jest.fn().mockReturnThis(),
  addOutputOption: jest.fn().mockReturnThis(),
  audioFilters: jest.fn().mockReturnThis(),
  mergeToFile: jest.fn().mockImplementation((_, callback) => callback(null, "Mocked output")),
  on: jest.fn(function (str, fun) {
    str === "end" && fun();
    return this;
  }),
  once: jest.fn().mockReturnThis(),
  save: jest.fn().mockImplementation((_, callback) => {
    callback(null, "stdout", "stderr");
  }),
  removeListener: jest.fn().mockReturnThis(),
  removeAllListeners: jest.fn().mockReturnThis(),
  duration: jest.fn().mockReturnValue(10),
  ffprobe: jest.fn().mockImplementation(callback => callback(null, { format: { duration: 10 } })),
};
