import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoList from "../components/VideoList";
import PageContainer from "./pageContainer";
import { getProfileImageDownloadUrl } from "../util";
import { Avatar } from "../components/Avatar";
import { Tooltip } from "@material-tailwind/react";
import { firebaseMethods } from "../utils/callFirebaseFunction";
import { callMicroservice } from "../utils/callFirebaseMicroservice";
import User from "@app/interfaces/User";

export default function Channel() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [numberOfVideos, setNumberOfVideos] = useState<number | null>(null);
  const [headerUrl, setHeaderUrl] = useState<string | null>(null);

  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile
    callMicroservice<User>(firebaseMethods.GET_USER_PROFILE, {
      uid: userId,
    })
      .then(result => {
        if (!result) {
          // Navigate to page not found if the user is not found
          navigate("/*");
          return;
        }
        setUserProfile(result);
      })
      .catch(() => navigate("/*"));
  }, []);

  useEffect(() => {
    if (!userProfile) {
      return;
    }
    if (!userProfile.header_url || userProfile.header_url === "") {
      // Default header
      setHeaderUrl("/head.jpg");
      return;
    }
    // Get downloadUrl for user header
    void getProfileImageDownloadUrl(userProfile.uid, userProfile.header_url).then(url => setHeaderUrl(url));
  }, [userProfile?.header_url]);

  const getNumberOfVideos = (number: number) => {
    setNumberOfVideos(number);
  };

  const getWebUrl = (webUrl: string) => {
    if (webUrl.startsWith("http://") || webUrl.startsWith("https://")) {
      return webUrl;
    }
    return `https://${webUrl}`;
  };

  return (
    <PageContainer className="px-4 pb-4" footer>
      <div
        className="max-h-72 h-72 rounded-b-lg w-full bg-no-repeat bg-cover"
        style={{ backgroundImage: `url('${headerUrl!}')` }}
      />
      <div className="flex items-center mt-4 justify-between">
        <div className="flex">
          <Avatar uid={userProfile?.uid ?? ""} avatarUrl={userProfile?.avatar_url} />
          <div className="ml-3">
            <p className="text-xl font-medium text-gray-700 group-hover:text-gray-900">{userProfile?.display_name}</p>
            <div className="flex flex-col text-xs font-medium text-gray-500 group-hover:text-gray-700">
              {userProfile?.location && <div>{userProfile?.location}</div>}
              {numberOfVideos === 0 ? "No videos" : numberOfVideos === 1 ? "1 video" : `${numberOfVideos!} videos`}
            </div>
          </div>
        </div>
        <div className="flex mt-6">
          {userProfile?.web && userProfile?.web !== "" && (
            <Tooltip content="Visit website">
              <a href={getWebUrl(userProfile?.web)} target="_blank" rel="noreferrer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 opacity-50 mr-3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-.51.766a2.25 2.25 0 01-1.161.886l-.143.048a1.107 1.107 0 00-.57 1.664c.369.555.169 1.307-.427 1.605L9 13.125l.423 1.059a.956.956 0 01-1.652.928l-.679-.906a1.125 1.125 0 00-1.906.172L4.5 15.75l-.612.153M12.75 3.031a9 9 0 00-8.862 12.872M12.75 3.031a9 9 0 016.69 14.036m0 0l-.177-.529A2.25 2.25 0 0017.128 15H16.5l-.324-.324a1.453 1.453 0 00-2.328.377l-.036.073a1.586 1.586 0 01-.982.816l-.99.282c-.55.157-.894.702-.8 1.267l.073.438c.08.474.49.821.97.821.846 0 1.598.542 1.865 1.345l.215.643m5.276-3.67a9.012 9.012 0 01-5.276 3.67m0 0a9 9 0 01-10.275-4.835M15.75 9c0 .896-.393 1.7-1.016 2.25"
                  />
                </svg>
              </a>
            </Tooltip>
          )}

          {userProfile?.twitter && userProfile?.twitter !== "" && (
            <Tooltip content="Visit Twitter profile">
              <a href={`https://twitter.com/${userProfile?.twitter}`} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className="w-6 h-6 opacity-50 mr-3">
                  <path
                    fill="currentColor"
                    d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
                  />
                </svg>
              </a>
            </Tooltip>
          )}

          {userProfile?.instagram && userProfile?.instagram !== "" && (
            <Tooltip content="Visit Instagram profile">
              <a href={`https://www.instagram.com/${userProfile?.instagram}`} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-6 h-6 opacity-50">
                  <path
                    fill="currentColor"
                    d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
                  />
                </svg>
              </a>
            </Tooltip>
          )}
        </div>
      </div>

      {userProfile?.about && (
        <div className="mx-auto w-full px-2 sm:px-4 lg:px-6 bg-slate-100 rounded mt-4 py-3 shadow-md mb-4">
          <div className="mb-1 text-gray-400 text-sm font-medium">About me</div>
          <div className="mb-3 text-gray-600 text-sm font-medium">{userProfile?.about}</div>
        </div>
      )}

      {userProfile?.uid && (
        <>
          <p className="text-xl font-medium text-gray-700 group-hover:text-gray-900 mt-3 mb-2">My Creations</p>
          <VideoList authorId={userProfile?.uid} getNumberOfVideos={getNumberOfVideos} />
        </>
      )}
    </PageContainer>
  );
}
