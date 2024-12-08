import { useEffect, useState, useRef, Fragment } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { AbortButton, PrimaryButton } from "@frontend/buttons";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { NewsletterTooltip } from "./NewsletterTooltip";
import { callMicroservice } from "@app/utils/callFirebaseMicroservice";
import { firebaseMethods } from "@app/utils/callFirebaseFunction";
import User from "@app/interfaces/User";
import { selectUser } from "@app/redux/selectors/user";

export function Settings() {
  const [userData, setUserData] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [saveDisabled, setSaveDisabled] = useState(true);

  const user = useSelector(selectUser);

  const dispatch = useDispatch();

  useEffect(() => {
    setUserData(user);
  }, [user]);

  const handleSaveUserData = () => {
    setSaveDisabled(true);
    const updatedUserData = { ...userData! };
    callMicroservice(firebaseMethods.SAVE_USER_PROFILE, updatedUserData)
      .then(() => {
        dispatch(setUser(updatedUserData));
      })
      .catch(() => {
        alert("Invalid data");
      });
  };

  return (
    <div className="">
      <div className="space-y-6 divide-y divide-gray-200 sm:space-y-5">
        {/*<div>
          <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            We'll always let you know about important changes, but you pick what else you want to hear about.
          </p>
  </div>*/}
        <div className="space-y-6 divide-y divide-gray-200 sm:space-y-5">
          <div className="pt-6 sm:pt-5">
            <div role="group" aria-labelledby="label-email">
              <div className="sm:grid sm:grid-cols-3 sm:items-baseline sm:gap-4">
                <div>
                  <div className="text-base font-medium text-gray-900 sm:text-sm sm:text-gray-700" id="label-email">
                    Email Settings
                  </div>
                </div>
                <div className="mt-4 sm:col-span-2 sm:mt-0">
                  <div className="max-w-lg space-y-4">
                    <div className="relative flex items-start">
                      <div className="flex h-5 items-center">
                        <input
                          id="newsletter"
                          name="newsletter"
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          onChange={e => {
                            setUserData({
                              ...userData!,
                              newsletter: e.target.checked ? "newsletter" : "no_newsletter",
                            });
                            setSaveDisabled(false);
                          }}
                          checked={userData?.newsletter == "newsletter"}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="newsletter" className="font-medium text-gray-700 cursor-pointer">
                          Newsletter <NewsletterTooltip />
                        </label>
                        <p className="text-gray-500">Get infos about new features and special events.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end">
          <PrimaryButton onClick={handleSaveUserData} disabled={saveDisabled}>
            Save
          </PrimaryButton>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg mt-10 sm:mt-12">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Delete your account</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Once you delete your account, you will lose all data associated with it.</p>
          </div>
          <div className="mt-5">
            <AbortButton onClick={() => setOpen(true)}>Delete account</AbortButton>
          </div>
        </div>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setOpen}>
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
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Deactivate account
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to deactivate your account? All of your data will be permanently
                          removed from our servers forever. This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => {
                        // Call firebase function deleteCurrentUser and then return to the main page
                        void callMicroservice(firebaseMethods.DELETE_CURRENT_USER, {}).then(() => {
                          // Redirect to main page
                          window.location.href = "/";
                        });
                      }}
                    >
                      Deactivate
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
}
