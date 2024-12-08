import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { SignInDialog } from "@backoffice/components/auth/SignInDialog";
import useLoginDialog from "@backoffice/hooks/useLoginDialog";

export default function LoginModal() {
  const { loginOpen: open, handleLoginOpen: setOpen } = useLoginDialog();

  function onBackgroundClick(val) {
    setOpen(val);
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onBackgroundClick}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            <SignInDialog setOpen={setOpen} />
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
