import { Fragment, useState } from "react";
import { Transition } from "@headlessui/react";
import { PrimaryButton } from "@frontend/buttons";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";

interface VerifyEmailModalProps {
  setOpen: (value: boolean) => void;
}

export default function VerifyEmailModal(props: VerifyEmailModalProps) {
  const { setOpen } = props;

  const [verificationEmailResent, setVerificationEmailResent] = useState<boolean>(false);
  const [verificationEmailResentError, setVerificationEmailResentError] = useState<boolean>(false);

  const resendVerificationEmail = async (): Promise<void> => {
    setVerificationEmailResentError(false);
    try {
      await callMicroservice(firebaseMethods.SEND_VERIFICATION_EMAIL);
      setVerificationEmailResent(true);
    } catch (error) {
      setVerificationEmailResentError(true);
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
        <div className="flex w-screen max-w-md flex-col justify-center items-center mx-4 md:mx-0 cursor-default">
          <img className="mx-auto w-40 h-auto" src="/logo_horiz_bw.jpg" alt="Pabolo" />
          <h2 className="mt-6 text-center text-lg md:text-xl font-bold tracking-tight text-gray-900">
            Email verification
          </h2>
          <p className="mt-2 text-center text-sm md:text-base text-gray-700">
            We just sent a verification link to your email address. Click on it and join the world of{" "}
            <strong>AI movies!</strong>
          </p>

          <p className="mt-2 text-center text-sm text-gray-600">Please check your junk folder!</p>

          <PrimaryButton className="mt-8 mb-2 px-8" onClick={() => setOpen(false)}>
            OK
          </PrimaryButton>

          {verificationEmailResent ? (
            <p className="mt-2 text-center text-sm text-gray-600">
              We just sent another verification link to your email address.
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't see the email? Click{" "}
              <strong className="text-indigo-600 hover:cursor-pointer" onClick={resendVerificationEmail}>
                here
              </strong>{" "}
              to resend it.
            </p>
          )}
          {verificationEmailResentError && (
            <p className="mt-2 text-center text-sm text-red-600">
              We were unable to send another verification link to your email address. Please try again later.
            </p>
          )}
        </div>
      </div>
    </Transition.Child>
  );
}
