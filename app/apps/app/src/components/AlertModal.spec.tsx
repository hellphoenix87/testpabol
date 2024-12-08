import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AlertModal from "./AlertModal";

describe("AlertModal", () => {
  beforeAll(() => {
    // Mock the ResizeObserver used by the AlertModal. Fix the "ResizeObserver is not defined" error.
    global.ResizeObserver = class ResizeObserver {
      observe() {
        // do nothing
      }
      unobserve() {
        // do nothing
      }
      disconnect() {
        // do nothing
      }
    };
  });

  test("renders with default props", () => {
    render(<AlertModal setOpen={vi.fn()} onAction={vi.fn()} open />);

    // Verify that the screen is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify that default action and cancel buttons are displayed
    expect(screen.getByText("Unlock")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("calls setOpen and onAction when action button is clicked", () => {
    const setOpenMock = vi.fn();
    const onActionMock = vi.fn();
    render(<AlertModal setOpen={setOpenMock} onAction={onActionMock} open />);

    // Simulate clicking the action button
    fireEvent.click(screen.getByText("Unlock"));

    // Verify that setOpen and onAction have been called
    expect(setOpenMock).toHaveBeenCalledTimes(1);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });
});
