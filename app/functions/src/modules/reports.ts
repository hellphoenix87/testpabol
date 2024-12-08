import express from "express";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import { validateSchemaWithErrorHandler } from "../utils/validation";
import { throwExpressError } from "../helpers";
import { validateUser } from "../middlewares/validateUser";
import { HttpStatusCodes } from "../constants/httpStatusCodes";
import corsMiddleware from "../middlewares/cors";
import { VideoReportSchema } from "../schema/VideoReport.schema";
import { getTimestamp } from "../utils/time";

/**
 Save the video Report
*/

export const saveVideoReport = async (req: express.Request, res: express.Response) => {
  try {
    const uid = req.user?.uid as string;
    const validatedBody: Record<string, any> = validateSchemaWithErrorHandler(req.body, VideoReportSchema);

    await admin.firestore().collection("videos-reports").doc().set(
      {
        video_id: validatedBody.videoId,
        description: validatedBody.description,
        author: uid,
        created_at: getTimestamp(),
      },
      { merge: true }
    );

    return res.status(HttpStatusCodes.OK).json({ message: "Video report saved successfully." });
  } catch (e: any) {
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: "Failed to save video report.",
    });
  }
};

// implement the express app routing.
const app = express();
app.use(corsMiddleware);

app.post("/saveVideoReport", validateUser, saveVideoReport);

export const reports = functions.region(process.env.PABOLO_FUNCTIONS_REGION!).https.onRequest(app);
