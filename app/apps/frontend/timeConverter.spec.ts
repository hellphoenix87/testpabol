import { describe, test, expect } from "vitest";
import { convertDuration, timeSince } from "./timeConverter";

describe("convertDuration", () => {
  test("should convert seconds to hh:mm:ss format", () => {
    expect(convertDuration(3661)).toBe("01:01:01");
    expect(convertDuration(120)).toBe("02:00");
    expect(convertDuration(59)).toBe("00:59");
  });

  test("should handle zero input", () => {
    expect(convertDuration(0)).toBe("00:00");
  });
});

describe("timeSince", () => {
  test("return time difference in appropriate format", () => {
    const now = Date.now();
    const oneYearAgo = now - 31536000000; // One year in milliseconds
    const oneWeekAgo = now - 604800000; // One week in milliseconds
    const oneDayAgo = now - 86400000; // One day in milliseconds
    const oneHourAgo = now - 3600000; // One hour in milliseconds
    const oneMinuteAgo = now - 60000; // One minute in milliseconds

    expect(timeSince(oneYearAgo / 1000)).toBe("1 year ago");
    expect(timeSince(oneWeekAgo / 1000)).toBe("1 week ago");
    expect(timeSince(oneDayAgo / 1000)).toBe("1 day ago");
    expect(timeSince(oneHourAgo / 1000)).toBe("1 hour ago");
    expect(timeSince(oneMinuteAgo / 1000)).toBe("1 minute ago");
  });

  test("return Just now for recent timestamps", () => {
    const now = Date.now();
    expect(timeSince(now / 1000)).toBe("Just now");
  });
});
