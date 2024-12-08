import * as admin from "firebase-admin";
import { Request } from "express-serve-static-core";
import { Response } from "express";
import Joi from "joi";
import * as logger from "firebase-functions/logger";
import { validateSchemaWithErrorHandler } from "../../../utils/validation";
import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { throwExpressError } from "../../../helpers";
import { deleteCollection } from "../../../utils/deleteCollection";
import {
  getCharactersListData,
  getLocationsListData,
  getScenesListData,
  setScenesData,
} from "../../../DB/creationRepository";
import { MAX_SCENES_COUNT } from "../../../../../shared";
import { GenerateMovie } from "../../../../../shared/types/Endpoints";
import SceneSchema from "../../../schema/Scene.schema";
import * as collectionGetters from "../../../DB/collectionGetters";
import { generateShotsResources } from "../controllers/generateShotsResources";
import { FunctionNames, buildUrl, invokeFirebaseFunction } from "../../../utils/invokeFirebaseFunction";
import { generateToken } from "../../../utils/googleAuth";
import { generateAssets } from "../controllers/generateAssets";
import { getTimestamp } from "../../../utils/time";
import { Collections } from "../../../constants/collections";
import { generateMusic } from "../controllers/generateMusic";

export const getScenes = async (req: Request, res: Response) => {
  const uid = req.user!.uid;
  // Receive creationId of the current Creation from FireStore: creations/uid/currentcreation
  const { creationId } = req.body;

  try {
    const scenes = await getScenesListData(uid, creationId);

    return res.status(HttpStatusCodes.OK).json({ scenes });
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to load scenes",
    });
  }
};

export const saveScenes = async (req: Request, res: Response) => {
  const uid = req.user!.uid;

  const { creationId, scenes } = req.body;

  try {
    const validatedScenes = validateSchemaWithErrorHandler(
      scenes,
      Joi.array().items(SceneSchema).max(MAX_SCENES_COUNT)
    );

    // Delete scenes from the subcollections
    const scenesRef = collectionGetters.getSceneListDoc(uid, creationId);
    await deleteCollection(scenesRef);

    // Store a document for each scene in the scene subcollection of the creation
    const batchResults = await setScenesData(uid, creationId, validatedScenes);

    return res.status(HttpStatusCodes.OK).json(batchResults);
  } catch (error) {
    logger.error(error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to save scenes",
    });
  }
};

export const generateMovie = async (
  req: Request<object, object, GenerateMovie>,
  res: Response<{ message: string }>
) => {
  const uid = req.user!.uid;
  const { creationId, title, genre, tags, audience, description, isAgeRestricted, isMock } = req.body;
  const commonBody = { creationId, genre, audience, tags };
  const commonGeneratorBody = { ...commonBody, uid, isMock, req };
  const videoDetails = { ...commonBody, title, description, isAgeRestricted };

  try {
    const scenes = await getScenesListData(uid, creationId);

    logger.log("generateMovie: get x-authorization token");
    const SAToken = await generateToken(buildUrl(FunctionNames.cookVideo));

    await generateMusic({ uid, creationId, scenes, isMock, req });
    await generateAssets({ ...commonGeneratorBody, title, scenes });

    logger.log("generateMovie: call getCharactersListData and getLocationsListData");
    const [characters, locations] = await Promise.all([
      getCharactersListData(uid, creationId),
      getLocationsListData(uid, creationId),
    ]);

    logger.log("generateMovie: call generateShotsResources");
    const scenesWithShots = await Promise.all(
      scenes.map(
        async (_, sceneIndex) =>
          await generateShotsResources({
            ...commonGeneratorBody,
            scenes,
            sceneIndex,
            locations,
            characters,
          })
      )
    );

    // Save video doc to firestore
    await admin
      .firestore()
      .collection(Collections.VIDEOS)
      .doc(creationId)
      .set(
        {
          thumbnail_images_url: scenesWithShots.map(scene => scene.shots[0].image_url),
          updated_at: getTimestamp(),
        },
        { merge: true }
      );

    logger.log("generateMovie: call cookVideo");
    await invokeFirebaseFunction(FunctionNames.cookVideo, {
      baseUrl: req.headers.host!,
      body: { data: { creationId, videoDetails } },
      headers: {
        authorization: req.headers.authorization,
        "x-authorization": SAToken,
      },
      retry: 2,
    });

    logger.log("generateMovie: finish with success");
    return res.status(HttpStatusCodes.OK).json({ message: "Shots were successfully generated" });
  } catch (error: any) {
    logger.error("generateMovie:", error.response?.data ?? error);
    return throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to generate shots with resources",
    });
  }
};
