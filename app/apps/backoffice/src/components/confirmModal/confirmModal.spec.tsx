import { describe, test, expect, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmModal, ConfirmButtonEnum } from "./confirmModal";
import "@testing-library/jest-dom/extend-expect";

describe("ConfirmModal", () => {
  beforeAll(() => {
    // Mock the ResizeObserver used by the Modal. Fix the "ResizeObserver is not defined" error.
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
    render(<ConfirmModal text="" title="" onClose={vi.fn()} show />);

    // Verify that the screen is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify that default action and cancel buttons are displayed
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("renders with provided props", () => {
    render(
      <ConfirmModal
        title="Test Title"
        text="Test Text"
        confirmBtnType={ConfirmButtonEnum.PRIMARY}
        confirmBtnTxt="Delete"
        cancelBtnTxt="Dismiss"
        onClose={vi.fn()}
        show
      />
    );

    // Verify that the provided title and text are displayed
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Text")).toBeInTheDocument();

    // Verify that custom action and cancel buttons are displayed
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    const onCloseMock = vi.fn();
    const onCancelMock = vi.fn();
    render(<ConfirmModal text="" title="" onClose={onCloseMock} onCancel={onCancelMock} show />);

    // Simulate clicking the cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Verify that onClose has been called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when cancel button is clicked", () => {
    const onConfirmMock = vi.fn();
    render(<ConfirmModal text="" title="" onConfirm={onConfirmMock} show />);

    // Simulate clicking the cancel button
    fireEvent.click(screen.getByText("Confirm"));

    // Verify that onConfirm has been called
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });
});
