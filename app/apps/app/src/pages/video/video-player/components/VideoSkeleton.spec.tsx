import { describe, test, vi } from "vitest";
import { render } from "@testing-library/react";
import VideoSkeleton, { NotAllowedTypeEnum } from "./VideoSkeleton";

vi.mock("@app/hooks/useLoginDialog", () => ({
  __esModule: true,
  default: () => ({
    handleLoginOpen: vi.fn(),
  }),
}));

describe("VideoSkeleton component", () => {
  test("should load the video skeleton loader if video not exist yet", () => {
    const { getByTestId } = render(<VideoSkeleton />);
    expect(getByTestId("skeleton-loader")).toBeInTheDocument();
  });

  test("should show the Age restriction container if the error type passed", () => {
    const { getByTestId } = render(<VideoSkeleton notAllowedType={NotAllowedTypeEnum.AGE_RESTRICTION} />);
    expect(getByTestId("adult-content-container")).toBeInTheDocument();
  });
});
