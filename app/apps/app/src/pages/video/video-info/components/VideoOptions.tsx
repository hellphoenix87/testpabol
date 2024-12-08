import { Menu, Transition } from "@headlessui/react";
import { classNames } from "@frontend/utils/classNames";
import { FlagIcon, EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { Fragment, useState } from "react";
import { ReportVideoDialog } from "./ReportVideoDialog";
import useLoginDialog from "@app/hooks/useLoginDialog";

interface VideoOptionsProps {
  videoId: string;
}

export function VideoOptions({ videoId }: VideoOptionsProps) {
  const [showVideoReportDialog, setShowVideoReportDialog] = useState(false);

  const { handleLoginOpenWithAuth } = useLoginDialog();

  const handleOpenReportDialog = () => {
    // Open login dialog if user is not logged in
    const dialogOpened = handleLoginOpenWithAuth(true);

    if (dialogOpened) {
      return;
    }

    setShowVideoReportDialog(true);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button>
        <EllipsisVerticalIcon className="w-5 h-5 opacity-70 ml-3 mt-1" />
      </Menu.Button>
      <ReportVideoDialog open={showVideoReportDialog} setOpen={setShowVideoReportDialog} videoId={videoId} />

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    "group flex items-center px-4 py-2 text-sm cursor-pointer"
                  )}
                  onClick={handleOpenReportDialog}
                >
                  <FlagIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                  Report
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
