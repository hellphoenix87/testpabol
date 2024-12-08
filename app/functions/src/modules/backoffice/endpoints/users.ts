import { Request, Response } from "express";
import { CollectionReference, DocumentData, Query } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

import { throwExpressError } from "../../../helpers";
import { HttpStatusCodes } from "../../../constants/httpStatusCodes";

import * as usersCollection from "../../../DB/usersCollection";
import * as videosCollection from "../../../DB/videosCollection";
import { getVideosInteractionsCount } from "../../../DB/videoInteractionsCollection";

import { getCreationsCount } from "../../../DB/collectionGetters";

export const getUsers = async (req: Request, res: Response) => {
  const { email, displayName } = req.body;

  let query: CollectionReference<DocumentData> | Query<DocumentData> = usersCollection.getUserListCollection();

  if (email) {
    query = query.where("email", "==", email);
  }

  if (displayName) {
    query = query.where("display_name", "==", displayName);
  }

  try {
    const snapshot = await query.get();
    const users = [];

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      users.push({ ...docData });
    }

    res.status(HttpStatusCodes.OK).json(users);
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to fetch users list",
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    const user = await usersCollection.getUserData(uid);
    const { videosLikes, videosDislikes } = await getVideosInteractionsCount(uid);
    const numberOfCreations = await getCreationsCount(uid);

    res.status(HttpStatusCodes.OK).json({ ...user, videosLikes, videosDislikes, numberOfCreations });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to fetch user's data",
    });
  }
};

export const deleteUserByID = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    await usersCollection.deleteUser(uid);

    res.status(HttpStatusCodes.OK).json({ message: `user '${uid}' successfully deleted.` });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to delete user",
    });
  }
};

export const changeAgeRestrictionFlag = async (req: Request, res: Response) => {
  const { isAgeRestricted, videoId } = req.body;

  try {
    await videosCollection.setVideoData(videoId, { isAgeRestricted });
    res.status(HttpStatusCodes.OK).json({ message: "Age restriction updated successfully", isAgeRestricted });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to accept video",
    });
  }
};

export const updateUserAccesstoCreator = async (req: Request, res: Response) => {
  const { uid } = req.body;

  try {
    const user = await usersCollection.getUserData(uid);

    await usersCollection.setUserData(uid, { is_creator: !user?.is_creator });

    res.status(HttpStatusCodes.OK).json({ message: "User's access to Creator feature updated successfully" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to update user's access to Creator feature",
    });
  }
};
