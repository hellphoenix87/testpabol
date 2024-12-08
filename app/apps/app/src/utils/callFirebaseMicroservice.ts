import { isConnectedToFunctionsEmulator, auth } from "@app/firebase/firebaseConfig";
import axios from "axios";
import { prependRev, firebaseMethods } from "./callFirebaseFunction";

enum MicrosevicesNames {
  VIDEOS = "videos",
  ACCOUNT = "account",
  CREATIONS = "creations",
  REPORTS = "reports",
  KITCHEN = "kitchen",
}

const MicroserviceMap: Record<MicrosevicesNames, firebaseMethods[]> = {
  [MicrosevicesNames.VIDEOS]: [
    firebaseMethods.GET_VIDEOS,
    firebaseMethods.GET_VIDEO_BY_ID,
    firebaseMethods.DELETE_VIDEO,
    firebaseMethods.UPDATE_VIDEO_VIEWS,
    firebaseMethods.UPDATE_VIDEO_LIKES_DISLIKES,
    firebaseMethods.GET_SIGNED_STREAM,
  ],
  [MicrosevicesNames.CREATIONS]: [
    firebaseMethods.GET_CREATIONS,
    firebaseMethods.DELETE_CREATION,
    firebaseMethods.SAVE_TITLE,
    firebaseMethods.GENERATE_TITLE_AND_PLOT,
    firebaseMethods.FINISH_CREATION,
    firebaseMethods.GENERATE_SUMMARY,
    firebaseMethods.SET_MAX_STEP,
    firebaseMethods.GENERATE_TITLE_AND_PLOT,
    firebaseMethods.SAVE_SCENES,
    firebaseMethods.GET_CREATION_TITLE_PLOT_META,
    firebaseMethods.UPDATE_SUMMARY,
    firebaseMethods.GET_SCENES,
    firebaseMethods.GENERATE_MOVIE,
  ],
  [MicrosevicesNames.ACCOUNT]: [
    firebaseMethods.GET_USER_PROFILE,
    firebaseMethods.DELETE_CURRENT_USER,
    firebaseMethods.SAVE_USER_PROFILE,
    firebaseMethods.GET_RANDOM_AVATAR_IMAGE,
    firebaseMethods.SEND_VERIFICATION_EMAIL,
  ],
  [MicrosevicesNames.REPORTS]: [firebaseMethods.SAVE_VIDEO_REPORT],
  [MicrosevicesNames.KITCHEN]: [firebaseMethods.BAKE_VIDEO, firebaseMethods.COOK_VIDEO],
};

// Function that takes a functionName and returns the microservice name
const getMicroserviceName = (functionName: firebaseMethods): MicrosevicesNames | null => {
  for (const [microserviceName, functions] of Object.entries(MicroserviceMap)) {
    if (functions.includes(functionName)) {
      return microserviceName as MicrosevicesNames;
    }
  }
  return null;
};

const isDeployedFunction = (methodName: string): boolean => {
  return !!process.env.DEPLOYED_FUNCTIONS?.split(",").includes(methodName);
};

const buildUrl = (microserviceName: MicrosevicesNames, functionName: firebaseMethods): string => {
  const projectId = process.env.PABOLO_PROJECT_ID!;
  const functionsRegion = process.env.PABOLO_FUNCTIONS_REGION!;

  const microserviceNameWithCommitHash = prependRev(microserviceName);

  if (isConnectedToFunctionsEmulator() && !isDeployedFunction(functionName)) {
    return `http://localhost:5001/${projectId}/${functionsRegion}/${microserviceNameWithCommitHash}/${functionName}`;
  }
  return `https://${functionsRegion}-${projectId}.cloudfunctions.net/${microserviceNameWithCommitHash}/${functionName}`;
};

export const generateStreamURL = async (cid: string) => {
  const microserviceName = getMicroserviceName(firebaseMethods.GET_SIGNED_STREAM)!;
  const token = await auth.currentUser?.getIdToken(true);
  return `${buildUrl(microserviceName, firebaseMethods.GET_SIGNED_STREAM)}?token=${token}&cid=${cid}`;
};

export const callMicroservice = async <T = any>(functionName: firebaseMethods, params?: object): Promise<T> => {
  const microserviceName = getMicroserviceName(functionName);
  if (!microserviceName) {
    console.error(`No microservice found for function ${functionName}`);
    throw new Error(`No microservice found for function ${functionName}`);
  }

  // If the user is logged in, we add the token to the request
  if (auth.currentUser) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${await auth.currentUser?.getIdToken(true)}`;
  }

  const url = buildUrl(microserviceName, functionName);

  const isMock = process.env.npm_config_mock === "true";

  const response = await axios.post(url, { isMock, ...params });
  return response.data as T;
};
