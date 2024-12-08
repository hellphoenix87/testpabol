import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProfileImageDownloadUrl, uploadImage } from "@app/util";
import ImageUploader from "@app/components/ImageUploader";
import { setUser } from "@app/redux/slices/userSlice";
import LoadingSpinner from "@app/components/LoadingSpinner";
import { AbortButton, SecondaryButton } from "@frontend/buttons";
import { AutoHeightTextarea } from "@app/components/AutoHeightTextarea";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import User from "@app/interfaces/User";
import { selectUser } from "@app/redux/selectors/user";
import useFormValidation from "@app/hooks/useFormValidation";
import { isEqual } from "lodash";
import useDeepEffect from "@app/hooks/useDeepEffect";
import { useLocation, useNavigate } from "react-router-dom";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { socialMediaPattern, webPattern } from "@shared/constants";

const userDataValidationRules = {
  display_name: (value: string) => {
    if (!value || value === "") {
      return "Display name is required";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters long";
    }
    return null;
  },
  about: (value: string) => {
    if (value && value.length > 1 && value.length < 20) {
      return "About must be more than 20 characters long";
    }
    return null;
  },
  twitter: (value: string) => {
    if (value && !socialMediaPattern.test(value)) {
      return "Invalid Twitter username";
    }
    return null;
  },
  instagram: (value: string) => {
    if (value && !socialMediaPattern.test(value)) {
      return "Invalid Instagram username";
    }
    return null;
  },
  web: (value: string) => {
    if (value && !webPattern.test(value)) {
      return "Invalid URL";
    }
    return null;
  },
};

export function Profile() {
  const user = useSelector(selectUser);
  const userDataRef = useRef<User>(user);
  const userRef = useRef<User>(user);

  const [avatarImageDataUrl, setAvatarImageDataUrl] = useState<string>("");
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null);
  const [headerImageDataUrl, setHeaderImageDataUrl] = useState<string>("");
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [Loading, setLoading] = useState<boolean>(true);

  const location = useLocation();

  const { formValues, formErrors, isFormValid, handleFormChange, resetFormValues } = useFormValidation<User>(
    location.state?.userdata || user,
    userDataValidationRules
  );

  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.userdata) {
      navigate("/account", { replace: true });
    }
  }, [location.state?.userdata]);

  useDeepEffect(() => {
    userRef.current = user;

    setAvatarImageFile(null);
    setHeaderImageFile(null);

    void getProfileImageDownloadUrl(user.uid, user.avatar_url).then(url => {
      setAvatarImageDataUrl(url);
      setHeaderImageDataUrl(url);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = e => {
      // If form values are different from user data, show a confirmation alert
      if (!isEqual(userRef.current, userDataRef.current)) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useDeepEffect(() => {
    userDataRef.current = formValues;
  }, [formValues]);

  useEffect(() => {
    return () => {
      if (isEqual(userRef.current, userDataRef.current)) {
        return;
      }

      const confirmation = confirm("Are you sure you want to leave? Your changes will not be saved.");

      if (confirmation) {
        // If the user confirms to discard changes, reset the form values to user data from Redux
        userDataRef.current = user;
        resetFormValues(user);
      } else {
        // If user cancels, navigate back to the account page Profile tab and provide the latest user data
        navigate("/account/0", { replace: true, state: { userdata: userDataRef.current } });
      }
    };
  }, []);

  const handleAvatarImageChange = (file: File): void => {
    setAvatarImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setAvatarImageDataUrl(reader.result as string);
    };
  };

  const handleCancelAvatarImage = (): void => {
    void getProfileImageDownloadUrl(user.uid, user.avatar_url).then(url => setAvatarImageDataUrl(url));
    setHeaderImageFile(null);
  };

  const handleHeaderImageChange = (file: File): void => {
    setHeaderImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setHeaderImageDataUrl(reader.result as string);
    };
  };

  const handleCancelHeaderImage = (): void => {
    void getProfileImageDownloadUrl(user.uid, user.header_url).then(url => setHeaderImageDataUrl(url));
    setHeaderImageFile(null);
  };

  const handleSave = async (): Promise<void> => {
    setLoading(true);
    // Update images url if files are selected and uploaded, otherwise keep the same images
    const avatarImageUrl = avatarImageFile
      ? await uploadImage(formValues.uid, "avatar", avatarImageFile)
      : user.avatar_url;
    const headerImageUrl = headerImageFile
      ? await uploadImage(formValues.uid, "header", headerImageFile)
      : user.header_url;

    const updatedUserData = { ...formValues, avatar_url: avatarImageUrl, header_url: headerImageUrl };
    callMicroservice(firebaseMethods.SAVE_USER_PROFILE, updatedUserData)
      .then(() => {
        dispatch(setUser(updatedUserData));
        handleCancelAvatarImage();
        handleCancelHeaderImage();
        userDataRef.current = updatedUserData;
      })
      .catch(() => {
        alert("Invalid data");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const isButtonDisabled = (): boolean => {
    return (formValues && isEqual(user, formValues) && !avatarImageFile && !headerImageFile) || !isFormValid;
  };

  if (Loading || !formValues) {
    return (
      <div className="relative h-screen max-h-[65vh]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
        <div className="space-y-6 sm:space-y-5">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Display Name
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex max-w-lg rounded-md shadow-sm">
                <input
                  type="text"
                  name="display_name"
                  id="display_name"
                  placeholder="Enter a display name here..."
                  className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formValues.display_name || ""}
                  onChange={handleFormChange}
                />
              </div>
              <span className="text-red-600 text-sm">{formErrors.display_name}</span>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              About
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <AutoHeightTextarea
                id="about"
                rows={3}
                className="block w-full max-w-lg rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={formValues.about || ""}
                onChange={handleFormChange}
              />
              <p className="mt-2 text-sm text-gray-500">This text will show up in your public profile.</p>
              <span className="text-red-600 text-sm">{formErrors.about}</span>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Location
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex max-w-lg rounded-md shadow-sm">
                <input
                  type="text"
                  name="location"
                  id="location"
                  autoComplete="location"
                  placeholder="Your location"
                  className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formValues.location || ""}
                  onChange={handleFormChange}
                />
              </div>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-center sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
              Avatar
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex items-center">
                <span className="h-12 w-12 overflow-hidden rounded-full bg-gray-100">
                  {avatarImageDataUrl ? (
                    <img className="h-full w-full text-gray-300" src={avatarImageDataUrl} alt="avatar image" />
                  ) : (
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </span>
                <ImageUploader fieldName="avatar" onChange={handleAvatarImageChange}>
                  <SecondaryButton className="ml-5">Change</SecondaryButton>
                </ImageUploader>
                {avatarImageFile && (
                  <AbortButton className="ml-5 " onClick={handleCancelAvatarImage}>
                    Cancel
                  </AbortButton>
                )}
              </div>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Profile Header
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="relative flex max-w-lg justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6 cursor-pointer hover:border-blue-500">
                {headerImageFile && (
                  <div className="absolute bottom-2 right-2 z-50 flex flex-row">
                    {headerImageFile && (
                      <AbortButton className="ml-5" onClick={handleCancelHeaderImage}>
                        Cancel
                      </AbortButton>
                    )}
                  </div>
                )}
                <ImageUploader fieldName="header" onChange={handleHeaderImageChange}>
                  <div className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600">
                    {headerImageDataUrl ? (
                      <div>
                        <img src={headerImageDataUrl} className="max-h-80" alt="header image" />
                      </div>
                    ) : (
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <span>Upload a file</span>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      </div>
                    )}
                  </div>
                </ImageUploader>
              </div>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:border-t sm:border-gray-200 sm:pt-5">
            <label htmlFor="twitter" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 opacity-50 mr-3">
                <path
                  fill="currentColor"
                  d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
                />
              </svg>
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex max-w-lg rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  twitter.com/
                </span>
                <input
                  type="text"
                  name="twitter"
                  id="twitter"
                  autoComplete="twitter"
                  placeholder="Your acccount"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formValues.twitter || ""}
                  onChange={handleFormChange}
                />
              </div>
              <span className="text-red-600 text-sm">{formErrors.twitter}</span>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-6 h-6 opacity-50">
                <path
                  fill="currentColor"
                  d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                />
              </svg>
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex max-w-lg rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                  instagram.com/
                </span>
                <input
                  type="text"
                  name="instagram"
                  id="instagram"
                  autoComplete="instagram"
                  placeholder="Your acccount"
                  className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formValues.instagram || ""}
                  onChange={handleFormChange}
                />
              </div>
              <span className="text-red-600 text-sm">{formErrors.instagram}</span>
            </div>
          </div>
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:pt-5">
            <label htmlFor="webpage" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
              Webpage
            </label>
            <div className="mt-1 sm:col-span-2 sm:mt-0">
              <div className="flex max-w-lg rounded-md shadow-sm">
                <input
                  type="text"
                  name="web"
                  id="web"
                  autoComplete="webpage"
                  placeholder="Address to your web page"
                  className="block w-full min-w-0 flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  value={formValues.web || ""}
                  onChange={handleFormChange}
                />
              </div>
              <span className="text-red-600 text-sm">{formErrors.web}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <button
            className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm disabled:hover:bg-indigo-600 disabled:cursor-not-allowed hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isButtonDisabled()}
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
