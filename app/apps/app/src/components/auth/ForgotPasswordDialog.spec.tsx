import { describe, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import FirebaseAuth from "../../firebase/auth";
import { Transition } from "@headlessui/react";

vi.mock("firebase/auth");
vi.mock("../../firebase/auth");

describe("ForgotPasswordDialog test", () => {
  it("should render the dialog correctly", () => {
    render(
      <Transition show={true}>
        <ForgotPasswordDialog setCurrentDialog={vi.fn()} />
      </Transition>
    );

    expect(screen.getByText("Reset your password")).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Send" })).toBeInTheDocument();
  });

  it("should display an error message when email is not provided", () => {
    render(
      <Transition show={true}>
        <ForgotPasswordDialog setCurrentDialog={vi.fn()} />
      </Transition>
    );

    const sendButton = screen.getByRole("button", { name: "Send" });
    fireEvent.click(sendButton);

    expect(screen.getByText("Please enter your email.")).toBeInTheDocument();
  });

  it("should display success message when password reset is successful", async () => {
    vi.spyOn(FirebaseAuth, "passwordReset").mockResolvedValueOnce();

    render(
      <Transition show={true}>
        <ForgotPasswordDialog setCurrentDialog={vi.fn()} />
      </Transition>
    );

    const emailInput = screen.getByLabelText("Email address");
    const sendButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(sendButton);

    expect(await screen.findByText("Please check your email for the reset link.")).toBeInTheDocument();
  });

  it("should display error message when password reset fails", async () => {
    vi.spyOn(FirebaseAuth, "passwordReset").mockRejectedValueOnce({ code: "auth/invalid-email" });

    render(
      <Transition show={true}>
        <ForgotPasswordDialog setCurrentDialog={vi.fn()} />
      </Transition>
    );

    const emailInput = screen.getByLabelText("Email address");
    const sendButton = screen.getByRole("button", { name: "Send" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(sendButton);

    expect(await screen.findByText("Your email is invalid.")).toBeInTheDocument();
  });
});
