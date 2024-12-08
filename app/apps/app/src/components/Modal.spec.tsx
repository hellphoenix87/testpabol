import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, ModalActionType } from "./Modal";

describe("Modal", () => {
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
    render(<Modal onClose={vi.fn()} show />);

    // Verify that the screen is rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Verify that default action and cancel buttons are displayed
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  test("renders with provided props", () => {
    render(
      <Modal
        title="Test Title"
        text="Test Text"
        actionType={ModalActionType.PRIMARY}
        actionBtn="Confirm"
        cancelBtn="Dismiss"
        onClose={vi.fn()}
        show
      />
    );

    // Verify that the provided title and text are displayed
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Text")).toBeInTheDocument();

    // Verify that custom action and cancel buttons are displayed
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  test("calls onClose when cancel button is clicked", () => {
    const onCloseMock = vi.fn();
    render(<Modal onClose={onCloseMock} show />);

    // Simulate clicking the cancel button
    fireEvent.click(screen.getByText("Cancel"));

    // Verify that onClose has been called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledWith(false);
  });

  test("calls onAction and onClose when action button is clicked", () => {
    const onActionMock = vi.fn();
    const onCloseMock = vi.fn();
    render(<Modal actionType={ModalActionType.PRIMARY} onAction={onActionMock} onClose={onCloseMock} show />);

    // Simulate clicking the action button
    fireEvent.click(screen.getByText("Delete"));

    // Verify that onAction and onClose have been called
    expect(onActionMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
    expect(onCloseMock).toHaveBeenCalledWith(false);
  });
});
