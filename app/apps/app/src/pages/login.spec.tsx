import { describe, test, vi } from "vitest";
import { render, fireEvent, waitFor } from "@testing-library/react";
import FirebaseAuth from "@app/firebase/auth";
import LoginModal from "./login";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";

vi.mock("firebase/auth");

// Mock the useLoginDialog hook
vi.mock("@app/hooks/useLoginDialog", () => ({
  __esModule: true,
  default: () => ({
    loginOpen: true,
    handleLoginOpen: vi.fn(),
  }),
}));

vi.mock("react-redux", () => {
  return {
    __esModule: true,
    useSelector: vi.fn().mockReturnValue({ loggedIn: false }),
    useDispatch: vi.fn(),
  };
});

vi.mock("@app/firebase/auth");
vi.mock("firebase/functions");
vi.mock("@app/utils/callFirebaseMicroservice");

describe("LoginModal Component", () => {
  test("render Sign In dialog by default", () => {
    const { getByText, getByLabelText } = render(<LoginModal />);

    expect(getByText("Email address")).toBeVisible();
    expect(getByText("Password")).toBeVisible();
    expect(getByText("Sign in")).toBeVisible();

    expect(getByLabelText("Email address")).toBeVisible();
    expect(getByLabelText("Password")).toBeVisible();
  });

  test("render sign up dialog when the currentDialog is set to SIGN_UP", () => {
    const { getByText, getByLabelText } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    expect(getByText("Email address")).toBeVisible();
    expect(getByText("Password")).toBeVisible();
    expect(getByText("Verify Password")).toBeVisible();
    expect(getByText("Sign Up")).toBeVisible();

    expect(getByLabelText("Email address")).toBeVisible();
    expect(getByLabelText("Password")).toBeVisible();
    expect(getByLabelText("Verify Password")).toBeVisible();
  });

  test("render forgot password dialog when the currentDialog is set to FORGOT_PASSWORD", () => {
    const { getByText } = render(<LoginModal />);

    const forgotPasswordLink = getByText("Forgot your password?");
    // Click the link to open Forgot Password dialog
    fireEvent.click(forgotPasswordLink);

    expect(getByText("Email address")).toBeVisible();
    expect(getByText("Send")).toBeVisible();
  });

  test("render Sign In and try to login when form is empty", () => {
    const { getByText } = render(<LoginModal />);

    const signInButton = getByText("Sign in");

    // Click the Sign In button
    fireEvent.click(signInButton);

    expect(FirebaseAuth.signInWithEmailAndPassword).not.toHaveBeenCalled();
    // Check that fill fields message is displayed
    expect(getByText("Please fill the fields.")).toBeVisible();
  });

  test("render Sign In dialog and fill address and email if user email is not verified", async () => {
    FirebaseAuth.signInWithEmailAndPassword = vi
      .fn()
      .mockResolvedValue({ user: { uid: "UserID" }, emailVerified: false });

    const { getByText, getByLabelText } = render(<LoginModal />);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const signInButton = getByText("Sign in");

    // Fill in the email and password
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    // Click the Sign In button
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(FirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith("test@test.com", "password");
      // Check that the Verify Email message is displayed
      expect(getByText("Please verify your email, check your inbox.")).toBeVisible();
    });
  });

  test("render Sign In dialog and fill address and email if user email is verified", async () => {
    FirebaseAuth.signInWithEmailAndPassword = vi
      .fn()
      .mockResolvedValue({ user: { uid: "UserID" }, emailVerified: true });

    const { getByLabelText, getByRole } = render(<LoginModal />);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const signInButton = getByRole("button", { name: "Sign in" });

    // Fill in the email and password
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    // Click the Sign In button
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(FirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith("test@test.com", "password");
    });
  });

  test("render sign up dialog and try to signup when form is empty", async () => {
    const { getByText, getByRole } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    const signUpButton = getByRole("button", { name: "Sign Up" });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(FirebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
      // Check that fill fields message is displayed
      expect(getByText("Please fill the fields.")).toBeVisible();
    });
  });

  test("render sign up dialog and fill up the form with invalid password", async () => {
    const { getByText, getByLabelText, getByRole } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const verifyPasswordInput = getByLabelText("Verify Password");
    const signUpButton = getByRole("button", { name: "Sign Up" });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } }); // Password is too weak
    fireEvent.change(verifyPasswordInput, { target: { value: "password" } }); // Password is too weak
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(FirebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
      // Check that password is invalid message is displayed
      expect(
        getByText(
          "Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
        )
      ).toBeVisible();
    });
  });

  test("render sign up dialog and fill up the form when password does not match verify password", async () => {
    const { getByText, getByLabelText, getByRole } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const verifyPasswordInput = getByLabelText("Verify Password");
    const signUpButton = getByRole("button", { name: "Sign Up" });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "Azerty123!" } });
    fireEvent.change(verifyPasswordInput, { target: { value: "Azerty123 different" } }); // Passwords don't match
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(FirebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
      // Check that the passwords do not match error message is displayed
      expect(getByText("Passwords do not match.")).toBeVisible();
    });
  });

  test("render sign up dialog and try to sign up without accepting terms of use", async () => {
    const { getByText, getByLabelText, getByRole } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const verifyPasswordInput = getByLabelText("Verify Password");
    const signUpButton = getByRole("button", { name: "Sign Up" });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "Azerty123!" } });
    fireEvent.change(verifyPasswordInput, { target: { value: "Azerty123!" } });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(FirebaseAuth.createUserWithEmailAndPassword).not.toHaveBeenCalled();
      // Check that accept terms of use message is displayed
      expect(getByText("Please accept the Terms of Use.")).toBeVisible();
    });
  });

  test("render sign up dialog and signup", async () => {
    FirebaseAuth.createUserWithEmailAndPassword = vi.fn().mockResolvedValueOnce({ user: { uid: "UserID" } });

    const { getByText, getByLabelText, getByTestId, getByRole } = render(<LoginModal />);

    const signUpLink = getByText("click here to register now");
    // Click the link to open the Sign Up dialog
    fireEvent.click(signUpLink);

    const emailInput = getByLabelText("Email address");
    const passwordInput = getByLabelText("Password");
    const verifyPasswordInput = getByLabelText("Verify Password");
    const termsOfUseSwitch = getByTestId("tos-switch");
    const signUpButton = getByRole("button", { name: "Sign Up" });

    // Fill in the form
    fireEvent.change(emailInput, { target: { value: "test@test.com" } });
    fireEvent.change(passwordInput, { target: { value: "Azerty123!" } });
    fireEvent.change(verifyPasswordInput, { target: { value: "Azerty123!" } });
    fireEvent.click(termsOfUseSwitch);
    fireEvent.click(signUpButton);

    await waitFor(async () => {
      expect(FirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledOnce();
      expect(callMicroservice).toHaveBeenCalledWith(firebaseMethods.SEND_VERIFICATION_EMAIL, {
        email: "test@test.com",
      });

      // Check that signup modal disappears (signup is successful)
      expect(signUpButton).not.toBeVisible();

      // Check that the Verify Email message is displayed
      expect(getByText("Email verification")).toBeVisible();

      // Click on resend email link
      fireEvent.click(getByText("here"));
      await waitFor(() => {
        expect(getByText("We just sent another verification link to your email address.")).toBeVisible();
      });
    });
  });
});
