import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Transition } from "@headlessui/react";
import FirebaseAuth from "@app/firebase/auth";
import { PrimaryButton } from "@frontend/buttons";
import LoginModalsTypes from "@app/constants/LoginModalsTypes";
import { selectUser } from "@app/redux/selectors/user";

interface SignInDialogProps {
  setCurrentDialog: (value: LoginModalsTypes) => void;
  setOpen: (value: boolean) => void;
}

// Key: Firebase error code, Value: Error message
const ErrorMessages = {
  "auth/invalid-email": "Invalid email.",
  "auth/user-disabled": "User disabled.",
  "auth/user-not-found": "User not found.",
  "auth/wrong-password": "Wrong password.",
  "auth/too-many-requests": "Too many requests. Try again later.",
  "auth/invalid-login-credentials": "Invalid login credentials.",
};

export function SignInDialog({ setCurrentDialog, setOpen }: SignInDialogProps) {
  const user = useSelector(selectUser);

  const [error, setError] = useState<string | null>(null);

  const signIn = async event => {
    event.preventDefault();

    setError(null);

    const data = new FormData(event.currentTarget);
    const values = {
      email: data.get("email") as string | null,
      password: data.get("password") as string | null,
    };

    if (!values.email || !values.password) {
      setError("Please fill the fields.");
      return;
    }

    try {
      setError("Signing in, please wait...");
      const userCredential = await FirebaseAuth.signInWithEmailAndPassword(values.email, values.password);
      // Check if user is emailVerified
      const user = userCredential.user;
      if (!user.emailVerified) {
        setError("Please verify your email, check your inbox.");
        void FirebaseAuth.logOut();
      }
    } catch (error: any) {
      // Replace common error messages with more user friendly messages
      if (error.code in ErrorMessages) {
        setError(ErrorMessages[error.code]);
      } else {
        setError("Something went wrong. Please try again later.");
      }
    }
  };

  // Facebook Oauth is not working for now
  // TODO: Fix Facebook Oauth and uncomment this
  /*
  const withFacebook = async () => {
    try {
      setError("Processing, Please wait...");
      await FirebaseAuth.withFacebook();
      setOpen(false);
    } catch (error) {
      console.log(error);
    }
  };
  */

  useEffect(() => {
    if (user.loggedIn) {
      setOpen(false);
    }
  }, [user]);

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
      <div className="relative transform overflow-hidden rounded-lg bg-white py-8 px-1 md:px-8 text-left shadow-xl transition-all w-full">
        <div className="flex w-screen max-w-md flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img className="mx-auto w-40 h-auto" src="/logo_horiz_bw.jpg" alt="Pabolo" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{" "}
              <span
                className="font-medium text-indigo-600 hover:text-indigo-500 hover:cursor-pointer"
                onClick={() => {
                  setCurrentDialog(LoginModalsTypes.SIGN_UP);
                }}
              >
                click here to register now
              </span>
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md ">
            <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10  bg-gray-50">
              <form className="space-y-6" action="#" onSubmit={signIn}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
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
                      autoComplete="current-password"
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                      Remember me
                    </label>
                  </div>

                  <div className="text-sm">
                    <span
                      className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
                      onClick={() => {
                        setCurrentDialog(LoginModalsTypes.FORGOT_PASSWORD);
                      }}
                    >
                      Forgot your password?
                    </span>
                  </div>
                </div>

                <PrimaryButton className="w-full" type="submit">
                  Sign in
                </PrimaryButton>
              </form>

              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
              {/*
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {
                    // Facebook Oauth is not working for now
                    // TODO: Fix Facebook Oauth and uncomment this
                    /*
                        <div onClick={withFacebook}>
                          <a
                            href="#"
                            className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                          >
                            <span className="sr-only">Sign in with Facebook</span>
                            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </a>
                        </div>
                      /
                  }

                  <div onClick={withGoogle}>
                    <a
                      href="#"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <span className="sr-only">Sign in with Google</span>
                      <img className="h-5 w-5" src="/googlelogo.svg" />
                    </a>
                  </div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </Transition.Child>
  );
}
