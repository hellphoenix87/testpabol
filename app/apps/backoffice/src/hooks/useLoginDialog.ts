import { useSelector, useDispatch } from "react-redux";
import { selectUtils } from "@backoffice/redux/selectors/utils";
import { setLoginOpen } from "@backoffice/redux/slices/utilsSlice";

function useLoginDialog() {
  const { loginOpen } = useSelector(selectUtils);

  const dispatch = useDispatch();

  const handleLoginOpen = value => {
    dispatch(setLoginOpen({ loginOpen: value }));
  };

  return {
    loginOpen,
    handleLoginOpen,
  };
}

export default useLoginDialog;
