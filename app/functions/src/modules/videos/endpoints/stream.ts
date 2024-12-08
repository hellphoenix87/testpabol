import { Request, Response } from "express";
import { logger } from "firebase-functions/v1";

import { HttpStatusCodes } from "../../../constants/httpStatusCodes";

import { getFileBuff, generateDirectorySignURLs } from "../../../utils/storage";
import { getUserFromToken, isModerator } from "../../../utils/googleAuth";

import { throwExpressError } from "../../../helpers";

export const getSignedStream = async (req: Request, res: Response) => {
  const { token, cid, userId, moderator } = req.query;

  try {
    const user = await getUserFromToken(token as string);
    const { uid: invokerId, email } = user ?? {};
    const uid = moderator && isModerator(email!) ? userId : invokerId;

    if (!uid) {
      res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Not Authorized!" });
      return;
    }

    if (!cid) {
      res.status(HttpStatusCodes.BAD_REQUEST).json({ error: "creation id is required" });
      return;
    }

    const bucket = process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE!;
    const dir = `${uid as string}/${cid as string}/stream`;

    // get the init stream file to modify it for the stream
    const streamConfigBuff = await getFileBuff(bucket, `${dir}/init.m3u8`);
    if (!streamConfigBuff) {
      res.status(HttpStatusCodes.NOT_FOUND).json({ error: "No Video stream for that ID!" });
      return;
    }

    let streamConfigStr = streamConfigBuff.toString();

    //  generate signed urls for all stream files
    const streamURLs = await generateDirectorySignURLs(bucket, {
      directory: dir,
    });

    for (const url of streamURLs) {
      const isChunkFile = /chunk[-]{1}\d{8}\.mp4/i.test(url.fileName);
      if (isChunkFile) {
        streamConfigStr = streamConfigStr.replace(url.fileName, url.url);
      }
    }

    res.send(Buffer.from(streamConfigStr));
  } catch (error) {
    logger.error(error);
    throwExpressError({
      res,
      error,
      internalErrorMessage: "Failed to get signed stream url",
    });
  }
};
