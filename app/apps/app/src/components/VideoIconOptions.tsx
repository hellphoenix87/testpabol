import { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { TrashIcon, ArrowPathRoundedSquareIcon } from "@heroicons/react/20/solid";
import ToastTypes from "@app/constants/ToastTypes";
import useToast from "@app/hooks/useToast";
import { classNames } from "@frontend/utils/classNames";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { Video, VideoStatus } from "@shared/types/Video";
import ConfirmModal from "./ConfirmModal";

interface VideoIconOptionsProps {
  video: Video;
  onVideoDeleted?: (videoId: string) => void;
  onVideoRegenerated?: (videoId: string) => void;
}

export default function VideoIconOptions(props: VideoIconOptionsProps) {
  const { video, onVideoDeleted, onVideoRegenerated } = props;

  const { openToast } = useToast();

  const [openDeleteVideoModal, setOpenDeleteVideoModal] = useState<boolean>(false);

  const handleDeleteVideo = async (): Promise<void> => {
    try {
      await callMicroservice(firebaseMethods.DELETE_VIDEO, { id: video.id });
      if (onVideoDeleted) {
        onVideoDeleted(video.id);
      }
      openToast("Movie deleted successfully", ToastTypes.SUCCESS);
    } catch (error) {
      openToast("Failed to delete the Movie", ToastTypes.ERROR);
    }
  };

  const handleRegenerateVideo = (): void => {
    try {
      void callMicroservice(firebaseMethods.COOK_VIDEO, { creationId: video.id });

      if (onVideoRegenerated) {
        onVideoRegenerated(video.id);
      }
      openToast("Video regeneration started", ToastTypes.SUCCESS);
    } catch (error) {
      console.log(error);
      openToast("Something bad happened, please try again", ToastTypes.ERROR);
    }
  };

  return (
    <>
      <ConfirmModal
        title="Do you want to delete the movie?"
        text="Once the movie is deleted, it cannot be restored."
        open={openDeleteVideoModal}
        setOpen={setOpenDeleteVideoModal}
        onAction={handleDeleteVideo}
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-38 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "group flex items-center px-4 py-2 text-sm w-full"
                    )}
                    onClick={() => setOpenDeleteVideoModal(true)}
                  >
                    <TrashIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    Delete
                  </button>
                )}
              </Menu.Item>
              {video.status === VideoStatus.FAILED && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={classNames(
                        active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                        "group flex items-center px-4 py-2 text-sm w-full"
                      )}
                      onClick={handleRegenerateVideo}
                    >
                      <ArrowPathRoundedSquareIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Regenerate
                    </button>
                  )}
                </Menu.Item>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
}
