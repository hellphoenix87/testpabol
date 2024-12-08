import * as functions from "firebase-functions";
import { logger } from "firebase-functions/v1";
import { CallableContext } from "firebase-functions/v1/https";

// This function logs a client's activity
export const logClientCrash = functions.https.onCall((data: any, context: CallableContext) => {
  const uid = context?.auth?.uid;

  const { error, params, isMock, userAgent } = data;

  if (error) {
    logger.error(
      "This error happened on client side,",
      uid && `User ID: ${uid},`,
      `Params passed to the function: ${JSON.stringify(params)},`,
      isMock ? "Mock data," : "Real data,",
      `userAgent: ${userAgent},`,
      error
    );
  }
});
