import { describe, test, vi } from "vitest";
import { render } from "@testing-library/react";

import { Avatar } from "./Avatar";

vi.mock("../util", () => {
  return {
    getProfileImageDownloadUrl: vi.fn(),
  };
});

vi.mock("@frontend/utils/classNames");

describe("Avatar", () => {
  test("renders headline", () => {
    render(<Avatar uid="" avatarUrl="" />);
  });
});
