import * as admin from "firebase-admin";
import { Request, Response } from "express";
import * as logger from "firebase-functions/logger";
import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { throwExpressError } from "../../../helpers";
import * as collectionGetters from "../../../DB/collectionGetters";
import { validateSchemaWithErrorHandler } from "../../../utils/validation";
import { CreateVideoSchema } from "../../../schema/CreateVideo.schema";

import { createNewVideoRecord } from "../controllers/createNewVideoRecord";
import { Collections } from "../../../constants/collections";
import { setCreationData } from "../../../DB/creationRepository";

// Return a list of all creations by a user
export const getCreations = async (req: Request, res: Response) => {
  const uid = req.user?.uid;
  const creations = collectionGetters.getCreationListDoc(uid!);

  try {
    const snapshot = await creations.where("completed", "!=", true).get();
    const creationsWithThumbnails = [];

    for (const doc of snapshot.docs) {
      // Add thumbnails if creation reached shots step
      creationsWithThumbnails.push({ id: doc.id, ...doc.data() });
    }

    return res.status(HttpStatusCodes.OK).json({ creations: creationsWithThumbnails });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to get creations",
    });
  }
};

export const deleteCreation = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { cid } = req.body;

  logger.log("deleteCreation", uid, cid);

  try {
    await collectionGetters.getCreationDoc(uid, cid).delete();

    return res.status(HttpStatusCodes.OK).json({ message: "Creation deleted successfully" });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: `Failed to delete creation with cid: ${cid}`,
    });
  }
};

export const finishCreation = async (req: Request, res: Response) => {
  const uid = req.user!.uid;

  try {
    const validatedData = validateSchemaWithErrorHandler(req.body, CreateVideoSchema);
    const videoRef = admin.firestore().collection(Collections.VIDEOS).doc(validatedData.creationId);
    const videoSnapshot = await videoRef.get();

    if (videoSnapshot && videoSnapshot.exists) {
      return res.status(HttpStatusCodes.OK).json({ success: false, message: "The video already exists" });
    }

    await createNewVideoRecord({ ...validatedData, uid });
    return res.status(HttpStatusCodes.OK).json({ success: true, message: "The video is saved" });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to save video",
    });
  }
};

export const setMaxStep = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { creationId, maxStep } = req.body;

  try {
    await setCreationData(uid, creationId, { maxStep });
    return res.status(HttpStatusCodes.OK).json({ message: "MaxStep is updated" });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to set max step",
    });
  }
};
