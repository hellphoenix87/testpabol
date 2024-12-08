import { Fragment, useState, useEffect, ReactElement } from "react";
import { Transition } from "@headlessui/react";
import { SignUpDialog } from "@app/components/auth/SignUpDialog";
import { ForgotPasswordDialog } from "@app/components/auth/ForgotPasswordDialog";
import { SignInDialog } from "@app/components/auth/SignInDialog";
import VerifyEmailModal from "@app/components/auth/VerifyEmailModal";
import useLoginDialog from "@app/hooks/useLoginDialog";
import LoginModalsTypes from "@app/constants/LoginModalsTypes";

export default function LoginModal() {
  const [currentDialog, setCurrentDialog] = useState<LoginModalsTypes>(LoginModalsTypes.SIGN_IN);

  const { loginOpen: open, handleLoginOpen: setOpen } = useLoginDialog();

  // If login is closed, reset currentDialog to signin
  useEffect(() => {
    if (!open) {
      setCurrentDialog(LoginModalsTypes.SIGN_IN);
    }
  }, [open]);

  const renderDialog = (): ReactElement => {
    switch (currentDialog) {
      case LoginModalsTypes.SIGN_IN:
        return <SignInDialog setCurrentDialog={setCurrentDialog} setOpen={setOpen} />;
      case LoginModalsTypes.SIGN_UP:
        return <SignUpDialog setCurrentDialog={setCurrentDialog} />;
      case LoginModalsTypes.FORGOT_PASSWORD:
        return <ForgotPasswordDialog setCurrentDialog={setCurrentDialog} setOpen={setOpen} />;
      case LoginModalsTypes.VERIFY_EMAIL:
        return <VerifyEmailModal setOpen={setOpen} />;
      default:
        return <SignInDialog setCurrentDialog={setCurrentDialog} setOpen={setOpen} />;
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <div className="relative z-20">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setOpen(false)} />
        </Transition.Child>

        <span className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="flex justify-center text-center items-center">{renderDialog()}</div>
        </span>
      </div>
    </Transition.Root>
  );
}
