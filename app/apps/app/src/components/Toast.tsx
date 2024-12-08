import { useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { classNames } from "@frontend/utils/classNames";
import useToast from "@app/hooks/useToast";
import ToastTypes from "@app/constants/ToastTypes";
import { selectUtils } from "@app/redux/selectors/utils";

export function Toast() {
  const { toastOpen, closeToast } = useToast();
  const { toast } = useSelector(selectUtils);

  if (!toastOpen) {
    return null;
  }

  return (
    <>
      <div
        className={classNames(
          "flex flex-row justify-center items-center fixed right-10 bottom-10 px-5 py-4 z-50 rounded-md drop-shadow-lg",
          toast?.type === ToastTypes.ERROR && "text-red-700 bg-red-200",
          toast?.type === ToastTypes.SUCCESS && "text-green-700 bg-green-200",
          toast?.type === ToastTypes.INFO && "text-blue-700 bg-blue-200"
        )}
      >
        <p className="text-sm">{toast?.message}</p>
        <button className="w-6 ml-2" onClick={closeToast}>
          <XMarkIcon />
        </button>
      </div>
    </>
  );
}
