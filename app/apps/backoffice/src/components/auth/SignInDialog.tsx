import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { loginWithMicrosoft, microsoftAuthProvider, signInWithEmailAndLinkProvider } from "@backoffice/firebase/auth";
import { ConfirmInputModal, ConfirmInputButtonEnum } from "../confirmModal/confirmInputModal";

interface SignInDialogProps {
  setOpen: (isOpen: boolean) => void;
}

export function SignInDialog({ setOpen }: SignInDialogProps) {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const handleMicrosoftLogin = async () => {
    try {
      await loginWithMicrosoft();
      setOpen(false);
    } catch (error: any) {
      if (error.code === "auth/account-exists-with-different-credential") {
        setEmail(error.customData.email);
        setPasswordModalOpen(true);
        return;
      }
      if (error.code === "auth/unauthorized-domain") {
        return alert("This domain is not authorized. Please contact the administrator.");
      }
      console.error(error);
    }
  };

  const handleSignInWithEmailAndLinkProvider = async password => {
    try {
      await signInWithEmailAndLinkProvider(email, password, microsoftAuthProvider);
    } catch (error) {
      console.error(error);
      alert("The provided password may be invalid.");
    } finally {
      setPasswordModalOpen(false);
      setOpen(false);
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
      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full max-w-lg sm:p-6">
        <div className="flex min-h-full flex-col justify-center">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <img className="mx-auto w-40 h-auto" src="/logo_horiz_bw.jpg" alt="Pabolo" />
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md ">
            <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10  bg-gray-50">
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  <div onClick={handleMicrosoftLogin}>
                    <a
                      href="#"
                      className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-500 shadow-sm hover:bg-gray-50"
                    >
                      <img className="h-8" src="/logo_ms.jpg" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConfirmInputModal
          show={passwordModalOpen}
          text="Type your Pabolo password"
          title="Password confirmation"
          confirmBtnTxt="Confirm"
          confirmBtnType={ConfirmInputButtonEnum.PRIMARY}
          password
          onClose={() => setPasswordModalOpen(false)}
          onConfirm={handleSignInWithEmailAndLinkProvider}
        />
      </Dialog.Panel>
    </Transition.Child>
  );
}
