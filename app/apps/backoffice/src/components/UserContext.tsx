import { PropsWithChildren, useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@backoffice/firebase/firebaseConfig";
import { setUser } from "@backoffice/redux/slices/userSlice";

export function UserContext({ children }: PropsWithChildren) {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      if (!currentUser) {
        dispatch(setUser({ loggedIn: false }));
        return;
      }

      // Save user data in Redux store
      // Only users with email @paramax.ai or @pabolo.ai are allowed to access the site
      if (currentUser && (currentUser.email?.endsWith("@paramax.ai") || currentUser.email?.endsWith("@pabolo.ai"))) {
        dispatch(setUser({ loggedIn: true, email: currentUser.email }));
      } else {
        dispatch(setUser({ loggedIn: false }));
        alert("You are not authorized to access this site.");
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
