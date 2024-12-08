import { getStrWithMarkers } from "./getStrWithMarkers";

describe("VideoCreator utils.getStrWithMarkers", () => {
  it("should return a string with the provided creationID", () => {
    const result = getStrWithMarkers("Hello World", "123");
    expect(result).toBe("Creation ID: 123. Hello World");
  });

  it("should return a string with default value if creationID is not provided", () => {
    const result = getStrWithMarkers("Hello World");
    expect(result).toBe("Hello World");
  });

  it("should handle empty string", () => {
    const result = getStrWithMarkers("", "456");
    expect(result).toBe("Creation ID: 456. ");
  });

  it("should handle empty string with default value", () => {
    const result = getStrWithMarkers("");
    expect(result).toBe("");
  });
});
