import { describe, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CreatorBottomButtons } from "./CreatorBottomButtons";

describe("CreatorBottomButtons component test", () => {
  const props = {
    showLockSymbol: false,
    nextButtonString: "",
    prevButtonString: "",
    disableNextButton: false,
    nextStepFun: vi.fn(),
    prevStepFun: vi.fn(),
    setUnlockWarningOpen: vi.fn(),
  };

  test('should not render the "prev step" and "next step" buttons', () => {
    render(<CreatorBottomButtons {...props} />);

    const prevStepBtn = screen.queryByTestId("prev-step-btn");
    const nextStepBtn = screen.queryByTestId("next-step-btn");

    expect(prevStepBtn).not.toBeInTheDocument();
    expect(nextStepBtn).not.toBeInTheDocument();
  });

  test('should render the "prev step" button', () => {
    render(<CreatorBottomButtons {...props} prevButtonString="Go Back" />);

    const prevStepBtn = screen.queryByTestId("prev-step-btn");

    expect(prevStepBtn).toBeInTheDocument();
    expect(prevStepBtn).toHaveTextContent("Go Back");
  });

  test('should render the "next step" button', () => {
    render(<CreatorBottomButtons {...props} nextButtonString="Go Back" />);

    const nextStepBtn = screen.queryByTestId("next-step-btn");

    expect(nextStepBtn).toBeInTheDocument();
    expect(nextStepBtn).toHaveTextContent("Go Back");
  });

  test('should render the "unlock" button', () => {
    render(<CreatorBottomButtons {...props} showLockSymbol />);

    const unlockBtn = screen.queryByTestId("unlock-btn");

    expect(unlockBtn).toBeInTheDocument();
    expect(unlockBtn).toHaveTextContent("Unlock");
  });

  test('should disable the "next step" button, if porps.disableNextButton is true', () => {
    render(<CreatorBottomButtons {...props} nextButtonString="Go Next" disableNextButton />);

    const nextStepBtn = screen.queryByTestId("next-step-btn");

    expect(nextStepBtn).toBeInTheDocument();
    expect(nextStepBtn).toBeDisabled();
  });
});
