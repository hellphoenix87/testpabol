import { PropsWithChildren, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { useDispatch } from "react-redux";
import { auth } from "@app/firebase/firebaseConfig";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { setUser } from "@app/redux/slices/userSlice";
import { getProfileImageDownloadUrl } from "@app/util";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";

export function UserContext({ children }: PropsWithChildren) {
  const dispatch = useDispatch();

  const getUserProfile = async (currentUser: User | null) => {
    const response = await callMicroservice(firebaseMethods.GET_USER_PROFILE, {
      uid: currentUser?.uid,
    });
    // Return user profile data
    return response;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (!currentUser) {
        dispatch(setUser({ loggedIn: false }));
        return;
      }

      let userData = await getUserProfile(currentUser);

      // if user is logged in but doesn't have a profile, assign default values
      // this happens with google oauth
      if (!userData) {
        userData = {
          uid: currentUser.uid,
          display_name: currentUser.displayName,
          email: currentUser.email,
          avatar_url: currentUser.photoURL,
          is_welcomed: false,
        };
      }

      // Get download url for profile images
      if (userData?.avatar_url) {
        const avatarUrl = await getProfileImageDownloadUrl(userData.uid, userData.avatar_url);
        userData = { ...userData, avatar_url: avatarUrl };
      }

      if (userData?.header_url) {
        const headerUrl = await getProfileImageDownloadUrl(userData.uid, userData.header_url);
        userData = { ...userData, header_url: headerUrl };
      }

      // Save user data in Redux store
      if (userData && currentUser.emailVerified) {
        dispatch(setUser({ ...userData, loggedIn: true }));
      } else {
        dispatch(setUser({ ...userData, loggedIn: false }));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return <>{children}</>;
}
