import { Request, Response } from "express";
import Joi from "joi";
import * as logger from "firebase-functions/logger";
import { creationGenerator, creationGeneratorMethods } from "../../../integrations/creationGenerator";
import { validateSchemaWithErrorHandler } from "../../../utils/validation";
import CreationMetaSchema from "../../../schema/CreationMeta.schema";
import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { throwExpressError } from "../../../helpers";
import { saveTitleAndScenes, setCreationData } from "../../../DB/creationRepository";
import * as collectionGetters from "../../../DB/collectionGetters";
import { saveCreationMetaData } from "../controllers/saveCreationMetaData";
import { addIdToItems } from "../controllers/addIdToItems";

export const generateTitleAndPlot = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { creationId, isMock, newCreation } = req.body;

  try {
    const validatedCreationMeta = validateSchemaWithErrorHandler(req.body, CreationMetaSchema);
    const newCreationId = await saveCreationMetaData({
      ...validatedCreationMeta,
      uid,
      newCreation,
      creationId,
    });

    const { title, scenes } = await creationGenerator(
      creationGeneratorMethods.GET_TITLE_PLOT,
      { ...validatedCreationMeta, cid: newCreationId, uid },
      { isMock, req }
    );

    const scenesWithId = addIdToItems(scenes);
    const dataToSaveAndReturn = { title, scenes: scenesWithId, creationId: newCreationId };

    await saveTitleAndScenes({ ...dataToSaveAndReturn, uid });

    return res.status(HttpStatusCodes.OK).json(dataToSaveAndReturn);
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to generate title and plot",
    });
  }
};

export const getCreationTitlePlotMeta = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { creationId } = req.body;

  try {
    const creation = await collectionGetters.getCreationData(uid, creationId);

    if (creation?.completed) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({
        message: "The requested creation is already completed",
      });
    }

    return res.status(HttpStatusCodes.OK).json(creation);
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to get creation title, plot and metadata",
    });
  }
};

export const saveTitleToFirestore = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  const { creationId, title } = req.body;

  try {
    if (!title) {
      return res.status(HttpStatusCodes.NOT_MODIFIED).json({ success: true, message: "The title is not modified" });
    }

    const validatedTitle = validateSchemaWithErrorHandler<string>(title, Joi.string().required());

    await setCreationData(uid, creationId, { title: validatedTitle });
    return res.status(HttpStatusCodes.OK).json({ success: true, message: "The title is successfully saved" });
  } catch (error) {
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to save title and plot",
    });
  }
};
