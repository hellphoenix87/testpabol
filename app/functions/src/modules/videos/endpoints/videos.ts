import { Request, Response } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v1";

import * as videosCollection from "../../../DB/videosCollection";
import * as usersCollection from "../../../DB/usersCollection";
import * as videoInteractionsCollection from "../../../DB/videoInteractionsCollection";

import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { callSemanticSearch } from "../../../integrations/semanticSearch";

import { getPopulatedVideosFromSnapshot, getSortedVideos } from "../../../utils/videos";
import { throwExpressError } from "../../../helpers";
import { getInteractionId } from "../controllers/getInteractionId";
import { Video, VideoStatus } from "../../../../../shared/types/Video";
import { determineInteractionAction } from "../controllers/determineInteractionAction";
import { Actions } from "../../../../../shared/constants/actions";
import { generateVideoUrls } from "../../../utils/collectionsGenerateURLs";

export const getVideos = async (req: Request, res: Response) => {
  const { forUser = false, title, sortType, selectedGenre = null, firstIndex = 0, lastIndex, authorId } = req.body;
  let videosQuery = videosCollection.getVideosCollection().where("deleted", "==", false);
  const usersQuery = usersCollection.getUserListSnapshot();
  const semanticSearchQuery = callSemanticSearch(title);

  // Filter videos created by the user who made the call (private videos for the author)
  if (forUser) {
    const uid = req.user!.uid;
    videosQuery = videosQuery.where("author", "==", uid);
  } else {
    // Filter videos that are ready, checked by moderation and accepted (public videos)
    videosQuery = videosQuery
      .where("status", "==", VideoStatus.READY)
      .where("checked_by_moderation", "==", true)
      .where("accepted", "==", true);
  }

  // Filter videos by author
  if (authorId && authorId.length > 0) {
    videosQuery = videosQuery.where("author", "==", authorId);
  }

  // Filter videos by genre
  if (typeof selectedGenre == "number" && selectedGenre !== null) {
    videosQuery = videosQuery.where("genre", "==", selectedGenre);
  }

  try {
    const [snapshot, usersSnapshot, semanticSearch] = await Promise.all([
      videosQuery.get(),
      usersQuery,
      semanticSearchQuery,
    ]);
    let videos = getPopulatedVideosFromSnapshot(snapshot, usersSnapshot, title, semanticSearch);
    const total = !title ? snapshot.size : videos.length;

    // Sort videos
    videos = getSortedVideos(videos, sortType, !!title);

    // Cut videos
    if (lastIndex) {
      videos = videos.slice(firstIndex, lastIndex);
    }

    // add the urls to the videos
    const videosWithSignedUrls = await Promise.all(videos.map((video: Video) => generateVideoUrls(video)));

    res.status(HttpStatusCodes.OK).json({ videos: videosWithSignedUrls, total });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to get videos",
    });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Video ID is required" });
    return;
  }

  try {
    const video = await videosCollection.getVideoData(id);

    if (!video) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Video not found" });
      return;
    }

    const user = await usersCollection.getUserData(video.author);

    if (!user) {
      // The endpoint handles the case when the author is deleted and the video will be shown with the author name "Deleted user"
      logger.info(`getVideoById: Video author with id ${video.author} not found for video id ${id}.
      The author was deleted, And will be displayed as "Deleted user"`);
    }

    const uid = req?.user?.uid || null;

    // Check if video is ready, not checked by moderation and the user is not the author
    const isVideoPrivateToCreator =
      video.status === VideoStatus.READY && !video.checked_by_moderation && video.author !== uid;

    // Check if video is deleted or not ready or private to creator
    if (video.deleted || video.status !== VideoStatus.READY || isVideoPrivateToCreator) {
      res.status(HttpStatusCodes.NOT_ALLOWED).json({ error: "The user is not allowed to see the video." });
      return;
    }

    // Get user interaction
    if (uid) {
      const interactionId = getInteractionId(uid, id);
      const userInteraction = await videoInteractionsCollection.getInteractionSnapshot(uid, interactionId);

      if (userInteraction.exists) {
        res.status(HttpStatusCodes.OK).json({
          ...video,
          avatar_url: user?.avatar_url,
          author_name: user?.display_name,
          userInteraction: userInteraction.data(),
        });
        return;
      }
    }

    const videoWithURLs = await generateVideoUrls(video);

    res
      .status(HttpStatusCodes.OK)
      .json({ ...videoWithURLs, avatar_url: user?.avatar_url, author_name: user?.display_name });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Video does not exist",
    });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Video ID is required" });
    return;
  }

  // Check if video exists and user is the author
  const video = await videosCollection.getVideoSnapshot(id);

  if (!video.exists) {
    res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Video does not exist" });
    return;
  }
  if (video.data()?.author !== req.user!.uid) {
    res.status(HttpStatusCodes.NOT_ALLOWED).json({ error: "The user is not allowed to delete the video" });
    return;
  }

  try {
    await videosCollection.setVideoData(id, { deleted: true });
    res.status(HttpStatusCodes.OK).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to delete the video",
    });
  }
};

export const updateVideoViews = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Video ID is required" });
    return;
  }

  try {
    await videosCollection.setVideoData(id, { views: FieldValue.increment(1) });
    res.status(HttpStatusCodes.OK).json({ success: true, message: "Video view updated successfully" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to update video view",
    });
  }
};

export const updateVideoLikesDislikes = async (req: Request, res: Response) => {
  const { id, action } = req.body;

  if (!id) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Video ID is required" });
    return;
  }

  const uid = req.user!.uid;
  const interactionId = getInteractionId(uid, id);

  try {
    const userInteraction = await videoInteractionsCollection.getInteractionData(uid, interactionId);
    const userInteractionActionData = userInteraction?.action ?? null;

    const { incrementLikes, incrementDislikes, decrementLikes, decrementDislikes } = determineInteractionAction(
      userInteractionActionData,
      action
    );

    await videosCollection.setVideoData(id, {
      likes: incrementLikes
        ? FieldValue.increment(1)
        : decrementLikes
          ? FieldValue.increment(-1)
          : FieldValue.increment(0),
      dislikes: incrementDislikes
        ? FieldValue.increment(1)
        : decrementDislikes
          ? FieldValue.increment(-1)
          : FieldValue.increment(0),
    });

    // Delete interaction if user removes like or dislike
    if ((decrementLikes && !incrementDislikes) || (decrementDislikes && !incrementLikes)) {
      await videoInteractionsCollection.deleteInteraction(uid, interactionId);
      res.status(HttpStatusCodes.OK).json({ action: null });
      return;
    }

    // Save like interaction
    if (incrementLikes) {
      await videoInteractionsCollection.setInteractionData(uid, interactionId, { action: Actions.LIKE });
      res.status(HttpStatusCodes.OK).json({ action: Actions.LIKE });
      return;
    }

    // Save dislike interaction
    if (incrementDislikes) {
      await videoInteractionsCollection.setInteractionData(uid, interactionId, { action: Actions.DISLIKE });
      res.status(HttpStatusCodes.OK).json({ action: Actions.DISLIKE });
      return;
    }

    res.status(HttpStatusCodes.NOT_MODIFIED).json({ message: "Likes/Dislikes not modified" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to update video likes/dislikes",
    });
  }
};
