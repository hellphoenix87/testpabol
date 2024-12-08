import { Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  MagnifyingGlassIcon,
  VideoCameraIcon,
  UserCircleIcon,
  LifebuoyIcon,
  FilmIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/20/solid";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@frontend/utils/classNames";
import WelcomeModal from "./pages/welcome";
import FirebaseAuth from "./firebase/auth";
import useLoginDialog from "./hooks/useLoginDialog";
import LoginModal from "./pages/login";
import { PrimaryButton, SecondaryButton } from "@frontend/buttons";
import UserMenuItem from "./components/UserMenuItem";
import { Avatar } from "./components/Avatar";
import { setSortType } from "./redux/slices/utilsSlice";
import SortTypes from "@app/constants/SortTypes";
import { selectUser } from "./redux/selectors/user";

interface NavBarProps {
  searchInitialContent?: string;
}

export default function NavBar({ searchInitialContent = "" }: NavBarProps) {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const { handleLoginOpen } = useLoginDialog();

  return (
    <>
      <LoginModal />
      <WelcomeModal />
      <Disclosure as="nav" className="bg-white shadow relative z-10">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex px-2 lg:px-0">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/">
                      <img className="block h-8 w-auto lg:hidden" src="/logo_icon.png" alt="pabolo" />
                      <img className="hidden h-8 w-auto lg:block" src="/logo_horiz_bw.jpg" alt="pabolo" />
                    </Link>
                  </div>
                </div>
                <div className="flex flex-1 items-center justify-center px-2">
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Search
                    </label>
                    <div className="relative">
                      <div
                        className="absolute inset-y-0 left-0 flex items-center pl-3 cursor-pointer"
                        onClick={() => {
                          // If the input form is not empty, redirect
                          const search = document.getElementById("search") as HTMLInputElement;
                          if (search?.value) {
                            navigate(`/search/${search.value}`);
                          }
                        }}
                      >
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Search"
                        type="search"
                        defaultValue={searchInitialContent}
                        onKeyDown={event => {
                          if (event.key !== "Enter") {
                            return;
                          }

                          const target = event.target as HTMLInputElement;

                          if (target.value) {
                            dispatch(setSortType(SortTypes.RELEVANCE));
                            navigate(`/search/${target.value}`);
                          } else {
                            navigate("/");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center lg:hidden">
                  {/* Mobile menu button */}
                  <Disclosure.Button
                    data-testid="mobile-disclosure-button"
                    className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                  >
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="hidden lg:ml-4 lg:flex lg:items-center">
                  <div className="flex-shrink-0">
                    {window.location.pathname === "/creations" ? null : (
                      <Link to="/creations">
                        <PrimaryButton className="mr-5 px-4">
                          <VideoCameraIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                          <span>Create Movie</span>
                        </PrimaryButton>
                      </Link>
                    )}
                  </div>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-4 flex-shrink-0">
                    <div className="flex justify-center items-center">
                      {user.authDataPending ? (
                        <ArrowPathIcon className="h-6 w-6 opacity-75 self-center animate-spin" />
                      ) : user.loggedIn ? (
                        <Menu.Button
                          id="user-menu-btn"
                          className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                          <span className="sr-only">Open user menu</span>
                          <Avatar uid={user.uid} avatarUrl={user.avatar_url} />
                        </Menu.Button>
                      ) : (
                        <SecondaryButton
                          onClick={() => {
                            handleLoginOpen(true);
                          }}
                        >
                          Sign In
                        </SecondaryButton>
                      )}
                      {!user.loggedIn && (
                        <Menu.Button>
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-50 p-3">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />{" "}
                          </svg>
                        </Menu.Button>
                      )}
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none divide-y divide-gray-100">
                        {user.loggedIn && (
                          <div className="px-4 py-3">
                            <p className="text-sm">Signed in as</p>
                            <p className="truncate text-sm font-medium text-gray-900">{user?.email ?? ""}</p>
                          </div>
                        )}
                        <div>
                          <UserMenuItem
                            to="/creations"
                            icon={VideoCameraIcon}
                            name="My Creations"
                            authRequired
                            creatorRequired
                          />
                          <UserMenuItem to="/account" icon={UserCircleIcon} name="Account" authRequired />
                          <UserMenuItem to="/feature" icon={SparklesIcon} name="Features" />
                          <UserMenuItem to="/contact" icon={LifebuoyIcon} name="Contact" />
                          <UserMenuItem to="/about" icon={FilmIcon} name="About pabolo" />

                          <hr className="h-px my-0.5 bg-gray-300 border-0"></hr>

                          {user.loggedIn && (
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => {
                                    void FirebaseAuth.logOut();
                                    window.location.reload();
                                  }}
                                  className={classNames(
                                    active ? "bg-gray-100" : "",
                                    "group flex items-center px-4 py-2 text-xs text-gray-400 w-full"
                                  )}
                                >
                                  Sign out
                                </button>
                              )}
                            </Menu.Item>
                          )}
                        </div>
                        <div>
                          <Menu.Item>
                            {({ active }) => (
                              <Link
                                to="/legal"
                                className={classNames(
                                  active ? "bg-gray-100" : "",
                                  "group flex items-center px-4 py-2 text-xs text-gray-400 w-full"
                                )}
                              >
                                Legal & Imprint
                              </Link>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="lg:hidden">
              <div className="space-y-1 pt-2 pb-3">
                {user.loggedIn && (
                  <div className="flex items-center px-4 pb-3">
                    <div className="flex-shrink-0">
                      <Avatar uid={user.uid} avatarUrl={user.avatar_url} />
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{user?.display_name ?? ""}</div>
                      <div className="text-sm font-medium text-gray-500">{user?.email ?? ""}</div>
                    </div>
                  </div>
                )}
                {!user.loggedIn && (
                  <Disclosure.Button
                    as="button"
                    className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    onClick={() => {
                      handleLoginOpen(true);
                    }}
                  >
                    <UserCircleIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Sign In
                  </Disclosure.Button>
                )}

                <div className="border-t border-gray-200 pt-2">
                  {window.location.pathname === "/creations" ? null : (
                    <Link to="/creations">
                      <PrimaryButton className="ml-4 mb-1">Create Movie</PrimaryButton>
                    </Link>
                  )}
                  {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800" */}
                  {user.loggedIn && user?.is_creator && (
                    <Disclosure.Button
                      as="a"
                      href="/creations"
                      className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    >
                      <VideoCameraIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      My Creations
                    </Disclosure.Button>
                  )}

                  {user.loggedIn && (
                    <Disclosure.Button
                      as="a"
                      href="/account"
                      className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                    >
                      <UserCircleIcon
                        className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      Account
                    </Disclosure.Button>
                  )}

                  <Disclosure.Button
                    as="a"
                    href="/feature"
                    className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                  >
                    <SparklesIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Features
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="a"
                    href="/contact"
                    className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                  >
                    <LifebuoyIcon
                      className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    Contact
                  </Disclosure.Button>

                  <Disclosure.Button
                    as="a"
                    href="/about"
                    className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                  >
                    <FilmIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                    About pabolo
                  </Disclosure.Button>

                  <hr className="h-px my-0.5 bg-gray-300 border-0"></hr>

                  {user.loggedIn && (
                    <Disclosure.Button
                      as="a"
                      href="#"
                      className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-xs font-base text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                      onClick={() => {
                        void FirebaseAuth.logOut();
                        window.location.reload();
                      }}
                    >
                      Sign out
                    </Disclosure.Button>
                  )}

                  <Disclosure.Button
                    as="a"
                    href="/legal"
                    className="flex border-l-4 border-transparent py-2 pl-3 pr-4 text-xs font-base text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800"
                  >
                    Legal & Imprint
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </>
  );
}
