import { Fragment, useState } from "react";
import FirebaseAuth from "@app/firebase/auth";
import { Transition, Switch } from "@headlessui/react";
import { PrimaryButton } from "@frontend/buttons";
import LoginModalsTypes from "@app/constants/LoginModalsTypes";
import { classNames } from "@frontend/utils/classNames";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { passwordPattern } from "@shared/constants";

interface SignUpDialogProps {
  setCurrentDialog: (value: LoginModalsTypes) => void;
}

export function SignUpDialog(props: SignUpDialogProps) {
  const { setCurrentDialog } = props;

  const [error, setError] = useState<string>("");

  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [tosAccepted, setTosAccepted] = useState<boolean>(false);

  const toggleTos = () => {
    setTosAccepted(!tosAccepted);
  };

  const signUp = async (event): Promise<void> => {
    event.preventDefault();

    setError("");

    const data = new FormData(event.currentTarget);

    const values = {
      email: data.get("email") as string | null,
      password: data.get("password") as string | null,
      verifyPassword: data.get("verifyPassword") as string | null,
    };

    if (!values.email || !values.password || !values.verifyPassword) {
      setError("Please fill the fields.");
      return;
    }

    if (!values.password.match(passwordPattern)) {
      setError(
        "Password must contain at least one number and one uppercase and lowercase letter, and at least 8 or more characters."
      );
      return;
    }

    if (values.password !== values.verifyPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!tosAccepted) {
      setError("Please accept the Terms of Use.");
      return;
    }

    setInputDisabled(true);

    try {
      await FirebaseAuth.createUserWithEmailAndPassword(values.email, values.password);
    } catch (catchedError: any) {
      // set error message with more readable messages isntead of error.code
      switch (catchedError.code) {
        case "auth/email-already-in-use":
          setError("Email already in use.");
          break;
        case "auth/invalid-email":
          setError("Invalid email.");
          break;
        case "auth/weak-password":
          setError("Password is too weak.");
          break;
        default:
          setError(catchedError.message);
          break;
      }
      setInputDisabled(false);
      console.log("Error code: " + catchedError.code + " - " + catchedError.message);
      return;
    }

    try {
      await callMicroservice(firebaseMethods.SEND_VERIFICATION_EMAIL, { email: values.email });
    } catch (catchedError: any) {
      setError(catchedError.message);
      return;
    }
    setCurrentDialog(LoginModalsTypes.VERIFY_EMAIL);
  };

  return (
    <Transition.Child
      as={Fragment}
      enter="ease-out duration-300"
      enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      enterTo="opacity-100 translate-y-0 sm:scale-100"
      leave="ease-in duration-200"
      leaveFrom="opacity-100 translate-y-0 sm:scale-100"
      leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    >
      <div className="relative transform overflow-hidden rounded-lg bg-white py-8 px-1 md:px-8 text-left shadow-xl transition-all w-full min-w-xl">
        <div className="flex w-screen max-w-md flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img className="mx-auto w-40 h-auto" src="/logo_horiz_bw.jpg" alt="Pabolo" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign up for your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">Get personalized content & rate and review movies</p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md ">
            <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10  bg-gray-50">
              <form className="space-y-6" action="#" onSubmit={signUp}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="Email"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      disabled={inputDisabled}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="Password"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      disabled={inputDisabled}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="verifyPassword" className="block text-sm font-medium text-gray-700">
                    Verify Password
                  </label>
                  <div className="mt-1">
                    <input
                      id="verifyPassword"
                      name="verifyPassword"
                      type="password"
                      autoComplete="Verify Password"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                      disabled={inputDisabled}
                    />
                  </div>
                </div>

                <div>
                  <Switch.Group as="div" className="flex items-center justify-between">
                    <span className="flex flex-grow flex-col mr-6">
                      <Switch.Description as="span" className="text-sm text-gray-500">
                        I&apos;ve read and accept{" "}
                        <a href="/termsofuse" target="_blank" className="text-indigo-600 hover:text-indigo-500">
                          Terms of use
                        </a>{" "}
                        and{" "}
                        <a href="/privacypolicy" target="_blank" className="text-indigo-600 hover:text-indigo-500">
                          Privacy Policy
                        </a>
                        .
                      </Switch.Description>
                    </span>
                    <Switch
                      data-testid="tos-switch"
                      checked={tosAccepted}
                      onChange={toggleTos}
                      className={classNames(
                        tosAccepted ? "bg-indigo-600" : "bg-gray-200",
                        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={classNames(
                          tosAccepted ? "translate-x-5" : "translate-x-0",
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                        )}
                      />
                    </Switch>
                  </Switch.Group>
                </div>

                <div>
                  <PrimaryButton className="w-full" disabled={inputDisabled}>
                    Sign Up
                  </PrimaryButton>
                </div>
              </form>

              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">
                      Already have an account?{" "}
                      <span
                        className="font-medium text-indigo-600 hover:text-indigo-500 hover:cursor-pointer"
                        onClick={() => setCurrentDialog(LoginModalsTypes.SIGN_IN)}
                      >
                        Click here
                      </span>
                      .
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition.Child>
  );
}
