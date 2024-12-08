import express from "express";
import admin from "firebase-admin";
import { logger } from "firebase-functions";

import {
  getAnimatedShotsStatus,
  getScenesListData,
  setAnimatedShotsStatus,
  setShotData,
} from "../../DB/creationRepository";
import { VideoCreator } from "../../../../shared";
import { getStrWithMarkers } from "../../../../shared/videoCreator/utils/getStrWithMarkers";
import { HttpStatusCodes } from "../../constants/httpStatusCodes";
import { BadRequestException, NotFoundException, throwExpressError } from "../../helpers";
import { Collections } from "../../constants/collections";
import { createNewVideoRecord } from "../../modules/creations/controllers/createNewVideoRecord";
import { FunctionNames, buildUrl, invokeFirebaseFunction } from "../../utils/invokeFirebaseFunction";
import { generateToken, validateGCPToken } from "../../utils/googleAuth";
import { generateSadTalkerVideos } from "./helper/generate-sad-talker";
import { Scene } from "../../schema/Scene.schema";
import { VideoStatus } from "../../../../shared/types/Video";
import { AnimatedShotsFlags } from "../../constants/animatedShotsFlags";

const logElapsedTime = (method: string, videoCreator: VideoCreator, hittingTime: number, creationId: string) => {
  const elapsedTime = videoCreator.getElapsedTime();
  const methodMsg = `Method: ${method}.`;
  const cookingTimeMsg = `Cooking time: ${Date.now() - hittingTime}.`;
  const mergingTimeMsg = `Merging time: ${elapsedTime.merging}.`;
  const scenesTimeMsg = `Scenes generating time: ${elapsedTime.scenes}`;

  logger.log(getStrWithMarkers(`${methodMsg} ${cookingTimeMsg} ${mergingTimeMsg} ${scenesTimeMsg}`, creationId));
};

const getAuthorUid = (videoSnapshot: any): string => {
  if (!videoSnapshot.exists) {
    throw new NotFoundException("Video does not exist");
  }
  if (videoSnapshot.data()?.status !== VideoStatus.FAILED) {
    throw new BadRequestException("Video is not in failed status, you cannot regenerate it");
  }
  // uid will be the uid of the user who created the video
  return videoSnapshot.data()?.author as string;
};

const getCurrentUser = async (req: express.Request): Promise<string | null> => {
  if (req?.user?.uid) {
    return req.user.uid;
  }

  const isServiceAccount = await validateGCPToken({
    token: req.headers["x-authorization"] as string,
    allowedServiceAccounts: [
      `app-kitchen@${process.env.PABOLO_PROJECT_ID}.iam.gserviceaccount.com`,
      `app-firebase-admin@${process.env.PABOLO_PROJECT_ID}.iam.gserviceaccount.com`,
    ],
  });

  if (!isServiceAccount || !req?.body?.uid) {
    return null;
  }

  return req.body.uid;
};

const prepareVideoToCook = async ({
  videoRef,
  videoDetails,
  regenerate,
  uid,
}: {
  videoRef: admin.firestore.DocumentData;
  regenerate: boolean;
  uid: string;
  videoDetails: any;
}): Promise<string> => {
  const videoSnapshot = await videoRef.get();
  let currentUID = uid;

  if (regenerate) {
    currentUID = getAuthorUid(videoSnapshot);
  } else if (!videoSnapshot.exists && videoDetails) {
    await createNewVideoRecord({ ...videoDetails, uid: currentUID });
  }

  if (videoSnapshot.exists) {
    videoRef.set({ status: VideoStatus.PENDING }, { merge: true });
  }

  return currentUID;
};

const generateVideoFile = async ({
  scenes,
  creationId,
  userId,
  token,
  SAToken,
}: {
  scenes: Scene[];
  creationId: string;
  userId: string;
  token?: string;
  SAToken?: string;
}) => {
  const hittingTime = Date.now();
  logger.log(getStrWithMarkers(`Number of the scenes ===> ${scenes.length}`, creationId));

  // invoke bake video for each scene
  await Promise.all(
    scenes.map((_, part) =>
      invokeFirebaseFunction(FunctionNames.bakeVideo, {
        body: { data: { creationId, part, uid: userId } },
        headers: {
          "x-authorization": SAToken,
          authorization: token,
        },
        retry: 2,
      })
    )
  );

  // merge the video files into one and get the final video duration
  const videoCreator = new VideoCreator({});
  const { duration, url } = await videoCreator.mergeVideos(userId, creationId);
  const videoData = { status: VideoStatus.READY, url, duration };

  logElapsedTime("cookVideo", videoCreator, hittingTime, creationId);

  // update the video status
  const videoRef = admin.firestore().collection(Collections.VIDEOS).doc(creationId);
  await videoRef.set(videoData, { merge: true });
  return videoData;
};

// bake video: generate a video form scenes and shots
export const bakeVideo = async (req: express.Request, res: express.Response) => {
  const { creationId, mimeType, part } = req.body;
  const hittingTime = Date.now();

  try {
    const uid = await getCurrentUser(req);

    if (!uid) {
      return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
    }

    const scenes = await getScenesListData(uid, creationId);
    const videoCreator = new VideoCreator({ mimeType, uid, cid: creationId });

    // generate the images and audio files
    await videoCreator.generate(scenes, part);

    // build the video file and upload it to GCP bucket.
    const url = await videoCreator.createFile();

    logElapsedTime("bakeVideo", videoCreator, hittingTime, creationId);

    return res.status(HttpStatusCodes.OK).json({ url });
  } catch (e: any) {
    logger.error(e);
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: getStrWithMarkers("Failed to bake video", creationId),
    });
  } finally {
    logger.log(getStrWithMarkers(`Finished baking video: ${Date.now() - hittingTime}`, creationId, part));
  }
};

// pub/sub message function listener, used to update the shot information
export const animateVideoPart = async (message: { data: any; attributes: Record<string, string> }) => {
  const creationId = message.attributes.creation_id;
  const userId = message.attributes.user_id;
  const sceneId = message.attributes.scene_id;
  const shotId = message.attributes.shot_id;
  const shotIndex = message.attributes.shot_index;
  const key = `scene_${sceneId}_shot_${shotId}`;
  const statusCode = message.data.response_status_code;

  // set the isGenerated flag for the newly generated shot and add the video_url to the shot record.
  await setAnimatedShotsStatus(userId, creationId, key);

  // get the animated shots
  const animatedShots = await getAnimatedShotsStatus(userId, creationId);
  const targetedShot = animatedShots[key];

  // only add the vide_url if the video successfully generated
  if (statusCode === HttpStatusCodes.OK) {
    await setShotData({
      uid: userId,
      creationId,
      sceneId,
      shotIndex: parseInt(shotIndex),
      shot: { video_url: targetedShot.video_url, duration: targetedShot.duration, id: shotId },
    });
  }

  // only generate the video file if all animated shots generated
  const animatedShotsArr = Object.values(animatedShots);
  if (
    !animatedShotsArr.length ||
    animatedShotsArr.find(shot => !shot.isGenerated) ||
    animatedShots?.[AnimatedShotsFlags.all]?.isGenerated
  ) {
    return;
  }

  // set all flag to true (used to know if all shots already generated or not)
  await setAnimatedShotsStatus(userId, creationId, AnimatedShotsFlags.all);

  // invoke the cook after all shot video animated.
  const SAToken = await generateToken(buildUrl(FunctionNames.cookVideo));
  await invokeFirebaseFunction(FunctionNames.cookVideo, {
    body: { data: { creationId, uid: userId } },
    headers: { "x-authorization": SAToken },
    retry: 2,
  });
};

// cook video: generate a video form scenes and shots
export const cookVideo = async (req: express.Request, res: express.Response) => {
  const { creationId, videoDetails, regenerate = false, isMock } = req.body;

  const currentUser = await getCurrentUser(req);

  if (!currentUser) {
    return res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }

  const videoRef = admin.firestore().collection(Collections.VIDEOS).doc(creationId);

  try {
    const uid = await prepareVideoToCook({ videoRef, videoDetails, regenerate, uid: currentUser });
    const scenes = await getScenesListData(uid, creationId);

    // do not run the sadTalker for the mock mode
    // ToDo: remove generate sadtalker for mock data
    const generateSadTalker = !isMock;
    const animatedShots = await getAnimatedShotsStatus(uid, creationId);

    if (generateSadTalker && !animatedShots?.all?.isGenerated) {
      const videoCreator = new VideoCreator({});
      await videoCreator.generate(scenes);
      const durations = videoCreator.getShotsDuration();
      await generateSadTalkerVideos({ uid, creationId, scenes, durations, animatedShots });
      return res.status(HttpStatusCodes.OK).send({ message: "video generating in progress." });
    }
    const videoData = await generateVideoFile({
      userId: uid,
      creationId,
      scenes,
      SAToken: req.headers["x-authorization"] as string,
      token: req.headers.authorization,
    });
    return res.status(HttpStatusCodes.OK).send(videoData);
  } catch (e: any) {
    await videoRef.set({ status: VideoStatus.FAILED }, { merge: true });
    logger.error(e);
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: getStrWithMarkers("Failed to cook video", creationId),
    });
  }
};
