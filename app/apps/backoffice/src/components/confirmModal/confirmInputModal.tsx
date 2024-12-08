import { Fragment, ElementType, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PrimaryButton, SecondaryButton, AbortButton, WarningButton } from "@frontend/buttons";
import { ArrowPathIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export enum ConfirmInputButtonEnum {
  PRIMARY = "PRIMARY",
  SECONDERY = "SECONDERY",
  ABORT = "ABORT",
  WARNING = "WARNING",
}

interface ConfirmInputModalProps {
  as?: ElementType;
  title: string;
  text: string;
  confirmBtnTxt?: string;
  confirmBtnType?: ConfirmInputButtonEnum;
  cancelBtnTxt?: string;
  show?: boolean;
  showCancelBtn?: boolean;
  loading?: boolean;
  password?: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm?: (value: string) => void;
}

/**
 * Modal component for displaying a dialog with an action and cancel button.
 */
export function ConfirmInputModal({
  as = "div",
  confirmBtnTxt = "Confirm",
  cancelBtnTxt = "Cancel",
  confirmBtnType = ConfirmInputButtonEnum.PRIMARY,
  title,
  text,
  loading = false,
  show = false,
  showCancelBtn = true,
  password = false,
  onClose,
  onCancel,
  onConfirm,
}: ConfirmInputModalProps) {
  const [opened, setOpened] = useState(show);
  const [inputValue, setInputValue] = useState("");

  // Update the opened state when the show prop changes.
  useEffect(() => {
    setOpened(show);
  }, [show]);

  const renderConfirmButton = () => {
    const props = {
      disabled: loading,
      className: "w-full sm:ml-3 sm:w-auto loading-button",
      onClick: () => {
        onConfirm?.(inputValue);
        setInputValue("");
      },
    };
    const content = loading ? (
      <ArrowPathIcon className="h-6 w-6 opacity-75 self-center animate-spin" />
    ) : (
      confirmBtnTxt
    );
    switch (confirmBtnType) {
      case ConfirmInputButtonEnum.SECONDERY:
        return <SecondaryButton {...props}>{content}</SecondaryButton>;
      case ConfirmInputButtonEnum.ABORT:
        return <AbortButton {...props}>{content}</AbortButton>;
      case ConfirmInputButtonEnum.WARNING:
        return <WarningButton {...props}>{content}</WarningButton>;
      default:
        return <PrimaryButton {...props}>{content}</PrimaryButton>;
    }
  };

  return (
    <Transition.Root show={opened} as={Fragment}>
      <Dialog
        as={as}
        className="relative z-10"
        onClose={() => {
          if (loading) {
            return;
          }
          setOpened(false);
          onClose?.();
          setInputValue("");
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <pre className="text-sm text-gray-500 whitespace-pre-wrap">{text}</pre>
                    </div>
                    <input
                      type={password ? "password" : "text"}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  {renderConfirmButton()}
                  {showCancelBtn && (
                    <button
                      type="button"
                      disabled={loading}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => {
                        setOpened(false);
                        onClose?.();
                        onCancel?.();
                        setInputValue("");
                      }}
                    >
                      {cancelBtnTxt}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
