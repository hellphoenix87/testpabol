import { useSelector, useDispatch } from "react-redux";
import { setToastOpen, setToastClosed } from "@app/redux/slices/utilsSlice";
import { selectUtils } from "@app/redux/selectors/utils";
import ToastTypes from "@app/constants/ToastTypes";

const TIMEOUT_MILLI_SECONDS = 10000;

function useToast() {
  const { toast } = useSelector(selectUtils);

  const dispatch = useDispatch();

  const openToast = (message: string, type: ToastTypes) => {
    dispatch(setToastOpen({ message, type }));

    setTimeout(() => {
      closeToast();
    }, TIMEOUT_MILLI_SECONDS);
  };

  const closeToast = () => {
    dispatch(setToastClosed());
  };

  return {
    toastOpen: toast !== null,
    openToast,
    closeToast,
  };
}

export default useToast;
