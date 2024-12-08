import axios from "axios";
import { auth } from "../firebase/firebaseConfig";

const BACKOFFICE_MICROSERVICE_NAME = "backoffice";
const KITCHEN_MICROSERVICE_NAME = "kitchen";

export enum backofficeFirebaseMethods {
  GET_VIDEOS = "getVideos",
  GET_VIDEO_BY_ID = "getVideoById",
  ACCEPT_VIDEO = "acceptVideo",
  REFUSE_VIDEO = "refuseVideo",
  SEND_EMAIL = "sendEmail",
  GET_VIDEOS_REPORTS = "getVideosReports",
  GET_USERS = "getUsers",
  GET_USER_BY_ID = "getUserById",
  UPDATE_ACCESS_TO_CREATOR = "updateUserAccesstoCreator",
  TOGGLE_AGE_RESTRICTION_FLAG = "changeAgeRestrictionFlag",
  DELETE_USER_BY_ID = "deleteUserByID",
  DELETE_VIDEO = "deleteVideo",
}

export enum kitchenFirebaseMethods {
  BAKE_VIDEO = "bakeVideo",
  COOK_VIDEO = "cookVideo",
}

export enum VideoMethods {
  GET_SIGNED_STREAM = "getSignedStream",
}

type FunctionType = backofficeFirebaseMethods | kitchenFirebaseMethods | VideoMethods;

const isDeployedFunction = (methodName: string): boolean => {
  return !!process.env.DEPLOYED_FUNCTIONS?.split(",").includes(methodName);
};

const isConnectedToFunctionsEmulator = () => {
  return typeof location === "undefined" || location.hostname === "localhost" || location.hostname === "127.0.0.1";
};

export function prependRev(functionName: string) {
  // must start with a letter: R for revision
  return "R" + process.env.__COMMIT_HASH__ + "_" + functionName;
}

const buildUrl = (functionName: FunctionType, microservice: string): string => {
  const projectId = process.env.PABOLO_PROJECT_ID;
  const functionsRegion = process.env.PABOLO_FUNCTIONS_REGION;

  const microserviceNameWithCommitHash = prependRev(microservice);

  if (isConnectedToFunctionsEmulator() && !isDeployedFunction(functionName)) {
    return `http://localhost:5001/${projectId}/${functionsRegion}/${microserviceNameWithCommitHash}/${functionName}`;
  }
  return `https://${functionsRegion}-${projectId}.cloudfunctions.net/${microserviceNameWithCommitHash}/${functionName}`;
};

export const callBackofficeMicroservice = async <T = any>(
  functionName: backofficeFirebaseMethods,
  params?: object
): Promise<{ data: T }> => {
  // If the user is logged in, we add the token to the request
  if (auth.currentUser) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${await auth.currentUser?.getIdToken(true)}`;
  }
  const url = buildUrl(functionName, BACKOFFICE_MICROSERVICE_NAME);
  const response = await axios.post(url, params || {});
  return response as { data: T };
};

export const callKitchenMicroservice = async <T = any>(
  functionName: kitchenFirebaseMethods,
  params?: object
): Promise<{ data: T }> => {
  // If the user is logged in, we add the token to the request
  if (auth.currentUser) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${await auth.currentUser?.getIdToken(true)}`;
  }
  const url = buildUrl(functionName, KITCHEN_MICROSERVICE_NAME);
  const response = await axios.post(url, params || {});
  return response as { data: T };
};

export const generateStreamURL = async (cid: string, userId) => {
  const token = await auth.currentUser?.getIdToken(true);
  const baseUrl = buildUrl(VideoMethods.GET_SIGNED_STREAM, "videos");
  return `${baseUrl}?token=${token}&cid=${cid}&userId=${userId}&moderator=true`;
};
