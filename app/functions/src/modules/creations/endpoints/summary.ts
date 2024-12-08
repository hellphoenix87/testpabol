import { Request, Response } from "express";
import * as logger from "firebase-functions/logger";
import { getScenesListData, setCreationData } from "../../../DB/creationRepository";
import { throwExpressError } from "../../../helpers";
import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { creationGenerator, creationGeneratorMethods } from "../../../integrations/creationGenerator";
import { getCreationData } from "../../../DB/collectionGetters";

export const updateSummary = async (req: Request, res: Response) => {
  const uid = req.user!.uid;

  const { creationId, summary } = req.body;

  // Get the creation from the users collection
  try {
    await setCreationData(uid, creationId, { summary });
    return res.status(HttpStatusCodes.OK).json({ summary });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to update creation summary",
    });
  }
};

export const generateSummary = async (req: Request, res: Response) => {
  const uid = req.user!.uid;

  const { creationId, isMock } = req.body;

  try {
    const creationData = await getCreationData(uid, creationId);
    const scenesData = await getScenesListData(uid, creationId);

    if (!creationData || !scenesData) {
      return res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Creation not found" });
    }

    // Get summary from py_backend
    const { summary } = await creationGenerator(
      creationGeneratorMethods.GET_SUMMARY,
      {
        cid: creationId,
        uid,
        genre: creationData.genre,
        attributes: creationData.attributes,
        audience: creationData.audience,
        title: creationData.title,
        scenes: scenesData,
      },
      { isMock, req }
    );

    // Save summary to firebase
    await setCreationData(uid, creationId, { summary });

    return res.status(HttpStatusCodes.OK).json({ summary });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to generate summary",
    });
  }
};
