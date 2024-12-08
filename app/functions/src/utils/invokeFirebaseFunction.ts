import axios from "axios";
import { prependRev } from "./utils";
import { logger } from "firebase-functions/v1";

export enum FunctionNames {
  cookVideo = "kitchen/cookVideo",
  bakeVideo = "kitchen/bakeVideo",
  animateVideoPart = "kitchen/animateVideoPart",
}

interface InvokeOptions {
  baseUrl?: string;
  body: Record<string, any>;
  headers?: Record<string, string | undefined>;
  retry?: number;
}

const TIMEOUT = 60 * 60 * 1000; // 1 hour

export const buildUrl = (functionName: FunctionNames): string => {
  const projectId = process.env.PABOLO_PROJECT_ID;
  const functionsRegion = process.env.PABOLO_FUNCTIONS_REGION;

  const functionNameWithHash = prependRev(functionName);

  if (process.env.FUNCTIONS_EMULATOR === "true") {
    return `http://127.0.0.1:5001/${projectId}/${functionsRegion}/${functionNameWithHash}`;
  }
  return `https://${functionsRegion}-${projectId}.cloudfunctions.net/${functionNameWithHash}`;
};

export const invokeFirebaseFunction = async (name: FunctionNames, options: InvokeOptions) => {
  try {
    const res = await axios.post(buildUrl(name), options.body, {
      timeout: TIMEOUT,
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });
    return res?.data;
  } catch (e) {
    logger.error(e);
    if (!options.retry) {
      throw e;
    }
    options.retry--;
    await invokeFirebaseFunction(name, options);
  }
};
