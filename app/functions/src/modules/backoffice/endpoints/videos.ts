import { Request, Response } from "express";
import { CollectionReference, DocumentData, Query } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v1";

import { Video } from "../../../../../shared/types/Video";

import { HttpStatusCodes } from "../../../constants/httpStatusCodes";
import { VideoFilters } from "../../../constants/videoFilters";

import { EmailTemplates, sendEmail } from "../../../utils/email";
import { buildVideoUrl } from "../../../utils/backofficeUtils";
import { getSortFunction, SortTypes } from "../../../utils/videos";

import { throwExpressError } from "../../../helpers";

import * as videosCollection from "../../../DB/videosCollection";
import * as usersCollection from "../../../DB/usersCollection";
import { getVideoReportsCollection } from "../../../DB/videoReportsCollection";

import { getVideoPopulatedWithUser } from "../controllers/getVideoPopulatedWithUser";
import { copyDir } from "../controllers/copyDir";
import { publishStreamManifest } from "../controllers/publishStreamManifest";
import { copyThumbnailImages } from "../controllers/copyThumbnailImages";

export const getVideos = async (req: Request, res: Response) => {
  const { videosFilter = VideoFilters.WAITING_FOR_REVIEW, sortType = SortTypes.NEWEST } = req.body;

  try {
    const usersQuery = usersCollection.getUserListSnapshot();
    const videosQuery: CollectionReference<DocumentData> | Query<DocumentData> =
      videosCollection.getVideosCollection();

    console.log("videosFilter", videosFilter);

    const filteredVideos = videosCollection.filterVideos[videosFilter as VideoFilters](videosQuery);
    const [snapshot, usersSnapshot] = await Promise.all([filteredVideos.get(), usersQuery]);
    const videosList = snapshot.docs
      .map(video => getVideoPopulatedWithUser(usersSnapshot, video.data() as Video))
      .sort(getSortFunction(sortType));

    res.status(HttpStatusCodes.OK).json(videosList);
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to fetch videos",
    });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  const { id } = req.body;

  try {
    const video = await videosCollection.getVideoData(id);

    if (!video) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Video not found" });
      return;
    }

    const user = await usersCollection.getUserData(video.author);

    if (user) {
      res
        .status(HttpStatusCodes.OK)
        .json({ ...video, author_name: user.display_name, author_avatar_url: user.avatar_url });
    } else {
      res.status(HttpStatusCodes.OK).json({ ...video });
    }
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to fetch video metadata",
    });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  const { id } = req.body;

  if (!id) {
    res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "Video ID is required" });
    return;
  }

  try {
    const video = await videosCollection.getVideoSnapshot(id);

    if (!video.exists) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: "Video does not exist" });
      return;
    }

    await videosCollection.setVideoData(id, { deleted: true });

    res.status(HttpStatusCodes.OK).json({ success: true, message: "Video deleted successfully" });
  } catch (error) {
    logger.error(error);
    res.status(HttpStatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Failed to delete the video" });
  }
};

export const acceptVideo = async (req: Request, res: Response) => {
  const { uid, display_name: displayName } = req.user!;
  const { videoId, checkedByModeration } = req.body;
  let dataToSave: Partial<Video> = {
    checked_by_moderation: true,
    accepted: true,
    checked_by_moderation_by: uid,
  };

  try {
    const video = await videosCollection.getVideoData(videoId);

    // If video was already checked by moderation, do not copy files again
    if (!checkedByModeration) {
      const streamUrl = `videos/${videoId}/stream`;

      // Copy video file to public bucket
      await copyDir({
        srcBucket: process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE!,
        srcPath: `${video?.author}/${videoId}/stream`,
        destBucket: process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE!,
        destPath: streamUrl,
      });

      await publishStreamManifest(process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE!, streamUrl);

      const publicThumbnailImagesUrls = await copyThumbnailImages(videoId);

      dataToSave = {
        ...dataToSave,
        url: streamUrl,
        thumbnail_images_url: publicThumbnailImagesUrls,
      };
    }

    await videosCollection.setVideoData(videoId, dataToSave);

    await sendEmail({
      template: EmailTemplates.ACCEPTED_VIDEO_EMAIL,
      receiverUid: video?.author ?? "",
      subject: "your movie has been accepted",
      variables: {
        displayName,
        movieTitle: video?.title,
        movieLink: buildVideoUrl(videoId),
      },
    });

    res.status(HttpStatusCodes.OK).json({ message: "Video accepted successfully" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to accept video",
    });
  }
};

export const refuseVideo = async (req: Request, res: Response) => {
  const { uid, display_name: displayName } = req.user!;
  const { videoId, reason } = req.body;

  try {
    const video = await videosCollection.getVideoData(videoId);

    await videosCollection.setVideoData(videoId, {
      checked_by_moderation: true,
      accepted: false,
      checked_by_moderation_by: uid,
      refuse_reason: reason,
    });

    await sendEmail({
      template: EmailTemplates.REJECTED_VIDEO_EMAIL,
      receiverUid: video?.author ?? "",
      subject: "your movie has been rejected",
      variables: {
        displayName,
        movieTitle: video?.title,
        reason: reason?.selected_reason,
        comment: reason?.text,
      },
    });

    res.status(HttpStatusCodes.OK).json({ message: "Video refused successfully" });
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to refuse video",
    });
  }
};

export const getVideosReports = async (req: Request, res: Response) => {
  const { videoId } = req.body;
  const videosReports = [];

  try {
    let query: CollectionReference<DocumentData> | Query<DocumentData> = getVideoReportsCollection();

    if (videoId) {
      query = query.where("video_id", "==", videoId);
    }

    const videoReports = await query.get();

    for (const report of videoReports.docs) {
      const docData = report.data();

      if (typeof docData.author === "string" && docData.author.length > 0) {
        const author = await usersCollection.getUserData(docData.author);
        const video = await videosCollection.getVideoData(docData.video_id);

        videosReports.push({ ...docData, author_name: author?.display_name, video_title: video?.title });
      }
    }

    res.status(HttpStatusCodes.OK).json(videosReports);
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to fetch videos reports",
    });
  }
};
