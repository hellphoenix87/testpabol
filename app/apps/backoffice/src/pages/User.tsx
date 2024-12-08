import {
  IdentificationIcon,
  RocketLaunchIcon,
  AtSymbolIcon,
  MapPinIcon,
  GlobeAltIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  FilmIcon,
  NoSymbolIcon,
  CheckIcon,
  PencilSquareIcon,
} from "@heroicons/react/20/solid";
import LoadingSpinner from "@backoffice/components/LoadingSpinner";
import PageContainer from "./PageContainer";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User as IUser } from "@shared/types";
import { getProfileImageDownloadUrl } from "@backoffice/util";
import { InstagramIcon, TwitterIcon } from "@backoffice/components/Icons";
import { ConfirmButtonEnum, ConfirmModal } from "@backoffice/components";
import { callBackofficeMicroservice, backofficeFirebaseMethods } from "@backoffice/utils/callFirebaseMicroservice";
import { timeSince } from "@frontend/timeConverter";
import { AbortButton } from "@frontend/buttons";

interface UserWithCreation extends IUser {
  videosLikes: number;
  videosDislikes: number;
  numberOfCreations: number;
  created_at: {
    _seconds: number;
  };
}

export default function User() {
  const [user, setUser] = useState<UserWithCreation | null>(null);
  const [showConfirmModal, setShowConfirmModel] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [reload, setReaload] = useState(0);

  const { uid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user's data
    callBackofficeMicroservice(backofficeFirebaseMethods.GET_USER_BY_ID, {
      uid,
    })
      .then(result => {
        if (!result.data) {
          // Navigate to page not found if the user is not found
          navigate("/*");
          return;
        }
        setUser(result.data);
      })
      .catch(() => navigate("/*"));
  }, [reload]);

  useEffect(() => {
    void getUserAvatarUrl();
  }, [user]);

  const getUserAvatarUrl = async () => {
    if (user) {
      const url = await getProfileImageDownloadUrl(user.uid, user.avatar_url);
      setAvatarUrl(url);
    }
  };

  const handleEmailClick = () => {
    const mailtoLink = `mailto:${user!.email}`;
    window.location.href = mailtoLink;
  };

  const handleCreatorAccessClick = async () => {
    const confirm = window.confirm(
      `Are you sure you want to ${
        user?.is_creator ? "revert this user's access" : "give this user access"
      } to Creator feature?`
    );
    // If user cancels the action, do nothing
    if (!confirm) {
      return;
    }

    try {
      const result = await callBackofficeMicroservice(backofficeFirebaseMethods.UPDATE_ACCESS_TO_CREATOR, {
        uid,
      });
      if (result.data) {
        setReaload(reload + 1);
        alert("User's access to creator has been updated");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWebUrl = webUrl => {
    if (webUrl.startsWith("http://") || webUrl.startsWith("https://")) {
      return webUrl;
    }
    return `https://${webUrl}`;
  };

  const deleteUser = async () => {
    await callBackofficeMicroservice(backofficeFirebaseMethods.DELETE_USER_BY_ID, {
      uid,
    });
    setModalLoading(false);
    setShowConfirmModel(false);
    navigate("/users");
  };

  return (
    <PageContainer className="p-4">
      {user ? (
        <div className="overflow-hidden bg-white py-2">
          <div className="px-6 md:px-0 lg:pr-4 lg:pt-4">
            <h2 className="text-base font-semibold leading-7">User's information</h2>

            <div className="flex flex-row justify-start items-center gap-2">
              {avatarUrl && <img className="inline-block h-14 w-14 rounded-full" src={avatarUrl} alt="Avatar Img" />}
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{user.display_name}</p>
              <a
                type="button"
                className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                href={`https://pabolo.ai/channel/${user?.uid}`}
              >
                Visit Pabolo profile
              </a>
            </div>

            <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <IdentificationIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  User ID:
                </dt>
                <dd className="inline">{user.uid}</dd>
              </div>

              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <RocketLaunchIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  Joined Pabolo:
                </dt>
                <dd className="inline">{timeSince(user.created_at._seconds)}</dd>
              </div>

              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <AtSymbolIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  Email:
                </dt>
                <dd className="inline">{user.email}</dd>
                <button
                  type="button"
                  className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={handleEmailClick}
                >
                  Send Email
                </button>
              </div>

              {user?.location && user?.location.length > 0 && (
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 mr-2">
                    <MapPinIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                    User's location:
                  </dt>
                  <dd className="inline">{user.location}</dd>
                </div>
              )}

              {user?.instagram && user?.instagram.length > 0 && (
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 mr-2">
                    <InstagramIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                    User's Instagram:
                  </dt>
                  <dd className="inline">{user.instagram}</dd>
                  <a
                    target="_blank"
                    className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    href={`https://www.instagram.com/${user?.instagram}`}
                    rel="noreferrer"
                  >
                    Visit Instagram profile
                  </a>
                </div>
              )}

              {user?.twitter && user?.twitter.length > 0 && (
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 mr-2">
                    <TwitterIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                    User's Twitter:
                  </dt>
                  <dd className="inline">{user.twitter}</dd>
                  <a
                    target="_blank"
                    className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    href={`https://twitter.com/${user?.twitter}`}
                    rel="noreferrer"
                  >
                    Visit Twitter profile
                  </a>
                </div>
              )}

              {user?.web && user?.web.length > 0 && (
                <div className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900 mr-2">
                    <GlobeAltIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                    User's Website:
                  </dt>
                  <dd className="inline">{user.web}</dd>
                  <a
                    target="_blank"
                    className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    href={getWebUrl(user?.web)}
                    rel="noreferrer"
                  >
                    Visit website
                  </a>
                </div>
              )}

              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <HandThumbUpIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  User's number of videos likes:
                </dt>
                <dd className="inline">{user?.videosLikes}</dd>
              </div>

              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <HandThumbDownIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  User's number of videos dislikes:
                </dt>
                <dd className="inline">{user?.videosDislikes}</dd>
              </div>

              <div className="relative pl-9">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <FilmIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  User's number of creations:
                </dt>
                <dd className="inline">{user?.numberOfCreations}</dd>
              </div>

              <div className="relative pl-9 flex flex-row justify-start items-center">
                <dt className="inline font-semibold text-gray-900 mr-2">
                  <PencilSquareIcon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                  User has access to Creator:
                </dt>
                <dd className="inline">
                  {user?.is_creator ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <NoSymbolIcon className="h-5 w-5 text-red-500" />
                  )}
                </dd>
                <button
                  type="button"
                  className="inline-flex ml-4 items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  onClick={handleCreatorAccessClick}
                >
                  {user?.is_creator ? (
                    <p className="text-red-500">Revert this user's access to Creator</p>
                  ) : (
                    <p className="text-green-500">Give this user access to Creator</p>
                  )}
                </button>
              </div>
              <div className="relative pl-9 flex flex-row-reverse">
                <AbortButton onClick={() => setShowConfirmModel(true)}>Delete</AbortButton>
              </div>
            </dl>
          </div>
        </div>
      ) : (
        <LoadingSpinner />
      )}
      <ConfirmModal
        show={showConfirmModal}
        loading={modalLoading}
        text={`Are you sure you want to delete ${user?.email}?`}
        title={"Delete User"}
        confirmBtnTxt={"Delete"}
        confirmBtnType={ConfirmButtonEnum.ABORT}
        onClose={() => setShowConfirmModel(false)}
        onConfirm={() => {
          setModalLoading(true);
          void deleteUser();
        }}
      />
    </PageContainer>
  );
}
