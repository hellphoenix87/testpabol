import { Fragment, ReactNode, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PrimaryButton } from "@frontend/buttons";

interface ModalProps {
  buttonTxt?: string;
  title?: string;
  subtitle?: string;
  show?: boolean;
  children?: ReactNode;
  onClose?: (value: boolean) => void;
}

export function LegalPreviewModal({
  title,
  subtitle,
  buttonTxt = "Close",
  show = false,
  children,
  onClose,
}: ModalProps) {
  const [opened, setOpened] = useState(show);

  useEffect(() => {
    setOpened(show);
  }, [show]);

  return (
    <Transition.Root show={opened} as={Fragment}>
      <Dialog
        className="relative z-10"
        onClose={() => {
          setOpened(false);
          onClose?.(false);
        }}
      >
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
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left" data-testid="legal-preview-modal">
                  <Dialog.Title as="h3" className="text-2xl font-semibold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                  <div className="mt-2">{children}</div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <PrimaryButton
                    onClick={() => {
                      setOpened(false);
                      onClose?.(false);
                    }}
                  >
                    {buttonTxt}
                  </PrimaryButton>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
