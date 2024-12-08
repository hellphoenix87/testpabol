import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { TrashIcon } from "@heroicons/react/20/solid";
import { classNames } from "@frontend/utils/classNames";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import ConfirmModal from "../ConfirmModal";

interface CreationIconOptionsProps {
  cid: string;
  onCreationDeleted?: (cid: string) => void;
}

export default function CreationIconOptions({ cid, onCreationDeleted }: CreationIconOptionsProps) {
  const { openToast } = useToast();

  const [openDeleteCreationModal, setOpenDeleteCreationModal] = useState(false);

  const handleDeleteCreation = async () => {
    try {
      await callMicroservice(firebaseMethods.DELETE_CREATION, { cid });
      if (onCreationDeleted) {
        onCreationDeleted(cid);
      }
      openToast("Creation deleted successfully", ToastTypes.SUCCESS);
    } catch (error) {
      openToast("Failed to delete the creation", ToastTypes.ERROR);
    }
  };

  return (
    <>
      <ConfirmModal
        title="Do you want to delete the creation?"
        text="Once the creation is deleted, it cannot be restored."
        open={openDeleteCreationModal}
        setOpen={setOpenDeleteCreationModal}
        onAction={handleDeleteCreation}
      />
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 15 15"
            className="w-5 h-5 opacity-50 mx-2 mt-4 flex-none"
          >
            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />{" "}
          </svg>
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "group flex items-center px-4 py-2 text-sm w-full"
                    )}
                    onClick={() => setOpenDeleteCreationModal(true)}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
