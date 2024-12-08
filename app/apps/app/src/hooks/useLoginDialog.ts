import { useSelector, useDispatch } from "react-redux";
import { setLoginOpen } from "../redux/slices/utilsSlice";
import { selectUser } from "@app/redux/selectors/user";
import { selectUtils } from "@app/redux/selectors/utils";

function useLoginDialog() {
  const user = useSelector(selectUser);
  const { loginOpen } = useSelector(selectUtils);

  const dispatch = useDispatch();

  const handleLoginOpen = (isOpen: boolean): void => {
    dispatch(setLoginOpen({ loginOpen: isOpen }));
  };

  const handleLoginOpenWithAuth = (isLoginOpen: boolean): boolean => {
    if (!user.loggedIn) {
      handleLoginOpen(isLoginOpen);
      return true;
    }
    return false;
  };

  return {
    loginOpen,
    handleLoginOpen,
    handleLoginOpenWithAuth,
  };
}

export default useLoginDialog;
