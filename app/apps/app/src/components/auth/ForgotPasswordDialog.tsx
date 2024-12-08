import { Fragment, useState } from "react";
import FirebaseAuth from "../../firebase/auth";
import { Transition } from "@headlessui/react";
import LoginModalsTypes from "../../constants/LoginModalsTypes";

export function ForgotPasswordDialog(props) {
  const { setCurrentDialog } = props;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const resetPassword = async event => {
    event.preventDefault();
    setSuccess(false);
    setError(null);

    const data = new FormData(event.currentTarget);
    const values = {
      email: data.get("email") as string | null,
    };

    if (!values.email) {
      setError("Please enter your email.");
      return;
    }
    try {
      await FirebaseAuth.passwordReset(values.email);
      setSuccess(true);
    } catch (e: any) {
      // set error message with more readable messages isntead of error.code
      switch (e.code) {
        case "auth/invalid-email":
          setError("Your email is invalid.");
          break;
        case "auth/user-not-found":
          setError("User not found.");
          break;
        default:
          setError(e.message);
          break;
      }
    }
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
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">Reset your password</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              We&apos;ll send you an email with a link to reset your password.
            </p>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md ">
            <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10  bg-gray-50">
              <form className="space-y-6" action="#" onSubmit={resetPassword}>
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
                  <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Send
                  </button>
                </div>
              </form>

              {error && <p className="mt-2 text-center text-sm text-red-600">{error}</p>}
              {success && (
                <p className="mt-2 text-center text-sm text-green-600">Please check your email for the reset link.</p>
              )}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-gray-50 px-2 text-gray-500">
                      Back to login page?{" "}
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => setCurrentDialog(LoginModalsTypes.SIGN_IN)}
                      >
                        Click here
                      </a>
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
