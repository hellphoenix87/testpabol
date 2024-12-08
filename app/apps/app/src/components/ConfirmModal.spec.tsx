import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ConfirmModal from "./ConfirmModal";

describe("ConfirmModal", () => {
  beforeAll(() => {
    // Mock the ResizeObserver used by the ConfirmModal. Fix the "ResizeObserver is not defined" error.
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
    render(<ConfirmModal title="Test Title" text="Test Text" open={true} setOpen={vi.fn()} onAction={vi.fn()} />);

    // Verify that the screen is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify that default action and cancel buttons are displayed
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("calls setOpen and onAction when action button is clicked", () => {
    const setOpenMock = vi.fn();
    const onActionMock = vi.fn();
    render(
      <ConfirmModal title="Test Title" text="Test Text" open={true} setOpen={setOpenMock} onAction={onActionMock} />
    );

    // Simulate clicking the action button
    fireEvent.click(screen.getByText("Delete"));

    // Verify that setOpen and onAction have been called
    expect(setOpenMock).toHaveBeenCalledTimes(1);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  test("calls setOpen when cancel button is clicked", () => {
    const setOpenMock = vi.fn();
    render(<ConfirmModal title="Test Title" text="Test Text" open={true} setOpen={setOpenMock} onAction={vi.fn()} />);

    // Simulate clicking the cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Verify that setOpen has been called
    expect(setOpenMock).toHaveBeenCalledTimes(1);
  });

  test("does not render when open is false", () => {
    render(<ConfirmModal title="Test Title" text="Test Text" open={false} setOpen={vi.fn()} onAction={vi.fn()} />);

    // Verify that the screen is not rendered
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
