import { HttpsCallableResult, httpsCallable } from "firebase/functions";
import { functions } from "../firebase/firebaseConfig";
import { logger } from "./logger";

const DEFAULT_TIMEOUT = 70000; // 70 seconds
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in ms

export function prependRev(functionName: string) {
  // must start with a letter: R for revision
  return "R" + process.env.__COMMIT_HASH__! + "_" + functionName;
}

export enum firebaseMethods {
  // Creations functions
  SAVE_SCENES = "saveScenes",
  GET_CREATION_TITLE_PLOT_META = "getCreationTitlePlotMeta",
  GET_SCENES = "getScenes",
  GET_CREATIONS = "getCreations",
  DELETE_CREATION = "deleteCreation",
  SAVE_TITLE = "saveTitle",
  GENERATE_TITLE_AND_PLOT = "generateTitleAndPlot",
  FINISH_CREATION = "finishCreation",
  GENERATE_SUMMARY = "generateSummary",
  GENERATE_MOVIE = "generateMovie",

  // Videos functions
  SET_MAX_STEP = "setMaxStep",
  UPDATE_SUMMARY = "updateSummary",

  // Videos functions
  GET_VIDEOS = "getVideos",
  GET_VIDEO_BY_ID = "getVideoById",
  DELETE_VIDEO = "deleteVideo",
  UPDATE_VIDEO_VIEWS = "updateVideoViews",
  UPDATE_VIDEO_LIKES_DISLIKES = "updateVideoLikesDislikes",
  GET_SIGNED_STREAM = "getSignedStream",

  // NetzDG functions
  SEND_NETZDG_EMAIL = "sendNetzdgEmail",

  // account functions
  GET_USER_PROFILE = "getUserProfile",
  DELETE_CURRENT_USER = "deleteCurrentUser",
  SAVE_USER_PROFILE = "saveUserProfile",
  GET_RANDOM_AVATAR_IMAGE = "getRandomAvatarImageUrl",

  // reports functions
  SAVE_VIDEO_REPORT = "saveVideoReport",
  SEND_VERIFICATION_EMAIL = "sendVerificationEmail",

  // Logs functions
  LOG_CLIENT = "logClientCrash",

  // Bake functions
  BAKE_VIDEO = "bakeVideo",
  COOK_VIDEO = "cookVideo",
}

const isMock = process.env.npm_config_mock === "true";

export async function logClientError(error, params) {
  const userAgent = window.navigator.userAgent;

  await httpsCallable(
    functions,
    firebaseMethods.LOG_CLIENT
  )({
    error,
    params,
    isMock,
    userAgent,
  });
}

function callFirebaseFunction<Response, Params = object>(
  functionName: firebaseMethods,
  params: Params
): Promise<HttpsCallableResult<Response>> {
  logger.log("Calling Firebase function", isMock, functionName, params);

  const timeout = functionName === firebaseMethods.COOK_VIDEO ? ONE_HOUR : DEFAULT_TIMEOUT;

  const calledFunction = httpsCallable<Params, Response>(functions, prependRev(functionName), { timeout });

  return calledFunction({
    isMock,
    ...params,
  }).catch(error => {
    logger.error("Error calling Firebase function", functionName, error);
    // Log the error on the server
    void logClientError(error, params);
    return Promise.reject(error);
  });
}

export default callFirebaseFunction;
