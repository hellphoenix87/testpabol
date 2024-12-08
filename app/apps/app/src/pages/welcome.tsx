import { Fragment, useState, useEffect, ChangeEvent, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PrimaryButton } from "@frontend/buttons";
import { useSelector, useDispatch } from "react-redux";
import { UsersIcon } from "@heroicons/react/20/solid";
import { ArrowPathRoundedSquareIcon, ArrowUpTrayIcon } from "@heroicons/react/24/outline";
import ImageUploader from "@app/components/ImageUploader";
import { getProfileImageDownloadUrl, uploadImage } from "@app/util";
import { setUser } from "@app/redux/slices/userSlice";
import NewsletterSwitch from "@app/components/NewsletterSwitch";
import { getDisplayName } from "@app/utils/welcomeModalUtils";
import User from "@app/interfaces/User";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import { selectUser } from "@app/redux/selectors/user";
import Lottie from "react-lottie-player";
import ImageWithSpinner from "@app/components/ImageWithSpinner";
import { ImageState } from "@app/constants/ImageState";
import { Tooltip } from "@material-tailwind/react";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";

export default function WelcomeModal() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const imageUploaderRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState<boolean>(false);
  const [userData, setUserData] = useState<User>(user);
  const [avatarImageDataUrl, setAvatarImageDataUrl] = useState<string | ArrayBuffer | null>("");
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null);
  const [newsletterEnabled, setNewsletterEnabled] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(getDisplayName());

  const handleAvatarImageChange = (file: File): void => {
    setAvatarImageFile(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      setAvatarImageDataUrl(reader.result);
    };
  };

  // If user is logged in and is_welcomed is false, show the welcome modal
  useEffect(() => {
    setUserData(user);
    if (user && user.loggedIn && !user.authDataPending && !user.is_welcomed) {
      setDisplayName(getDisplayName());
      void getProfileImageDownloadUrl(user.uid, user.avatar_url).then(url => {
        setAvatarImageDataUrl(url);
      });
      setOpen(true);
    }
  }, [user]);

  const handleSave = async (): Promise<void> => {
    setButtonDisabled(true);
    //  Update images url if files are selected and uploaded, otherwise keep the same images
    const avatarImageUrl = avatarImageFile
      ? await uploadImage(userData.uid, "avatar", avatarImageFile)
      : avatarImageDataUrl;

    const updatedUserData = {
      uid: userData.uid,
      avatar_url: avatarImageUrl,
      newsletter: newsletterEnabled ? "newsletter" : "no_newsletter",
      display_name: displayName,
      is_welcomed: true,
    };
    callMicroservice(firebaseMethods.SAVE_USER_PROFILE, updatedUserData)
      .then(() => {
        dispatch(setUser({ ...userData, ...updatedUserData }));
      })
      .catch(() => {
        alert("Invalid data");
        setButtonDisabled(false);
      })
      .finally(() => {
        setOpen(false);
      });
  };

  const handleRandomAvatarIconClick = async (): Promise<void> => {
    setAvatarImageDataUrl(ImageState.LOADING);

    const avatarImageResponse = await callMicroservice(firebaseMethods.GET_RANDOM_AVATAR_IMAGE);
    const url = await getProfileImageDownloadUrl(user.uid, avatarImageResponse.url as string);

    setAvatarImageDataUrl(url);
  };

  const handleUploadImageIconClick = (): void => {
    imageUploaderRef?.current?.click();
  };

  const onDisplayNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(e.target.value);

    // If displayname is empty, disable button
    setButtonDisabled(e.target.value.trim() === "");
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => null}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full justify-center p-4 text-center items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 w-full max-w-lg sm:p-6">
                <div className="flex min-h-full flex-col justify-center">
                  <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="flex justify-center items-center h-12">
                      <Lottie
                        path={"/logo_animations/welcome.json"}
                        className="player h-24 relative left-1"
                        loop
                        play
                      />
                      <img className="w-auto h-8 ml-1" src="/logo_horiz_bw_fontonly.png" alt="Pabolo" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                      Welcome to pabolo!
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">Let&apos;s personalize your profile.</p>
                  </div>

                  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md ">
                    <div className="py-8 px-4 shadow sm:rounded-lg sm:px-10  bg-gray-50">
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Display Name
                          </label>
                          <div className="relative flex flex-grow items-stretch focus-within:z-10 mt-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <UsersIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                              value={displayName}
                              id="username"
                              name="username"
                              type="username"
                              autoComplete="username"
                              placeholder="Enter a name here..."
                              className="block w-full rounded border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-6 focus:ring-indigo-600 focus:ring-2 focus:ring-inset"
                              onChange={e => onDisplayNameChange(e)}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex flex-col justify-center items-center gap-1 mt-2">
                            <ImageUploader fieldName="avatar" onChange={handleAvatarImageChange}>
                              <div className="flex items-center justify-center" ref={imageUploaderRef}>
                                <span className="h-32 w-32 overflow-hidden rounded-full shadow-md hover:outline-none hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 cursor-pointer">
                                  <ImageWithSpinner
                                    className="h-full w-full text-gray-500"
                                    src={avatarImageDataUrl ? (avatarImageDataUrl as string) : "/user.jpg"}
                                    alt="avatar image"
                                  />
                                </span>
                              </div>
                            </ImageUploader>
                            <div className="flex flex-row gap-6 mt-4">
                              <button onClick={handleRandomAvatarIconClick}>
                                <Tooltip placement="top" content="Get random avatar" className="z-50">
                                  <ArrowPathRoundedSquareIcon className="w-7 h-7 text-gray-600" />
                                </Tooltip>
                              </button>
                              <button onClick={handleUploadImageIconClick}>
                                <Tooltip placement="top" content="Upload image" className="z-50">
                                  <ArrowUpTrayIcon className="w-6 h-6 text-gray-600" />
                                </Tooltip>
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2">
                          <NewsletterSwitch enabled={newsletterEnabled} setEnabled={setNewsletterEnabled} />
                        </div>
                        <div>
                          <PrimaryButton className="w-full" onClick={handleSave} disabled={buttonDisabled}>
                            {buttonDisabled && displayName.trim() != "" ? "Saving..." : "Let's go!"}
                          </PrimaryButton>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
