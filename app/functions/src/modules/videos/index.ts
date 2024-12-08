import express from "express";
import * as functionsV2 from "firebase-functions/v2/https";

import { validateUser, strictValidateUser } from "../../middlewares/validateUser";
import corsMiddleware from "../../middlewares/cors";

import * as videosEndpoints from "./endpoints/videos";
import * as streamEndpoints from "./endpoints/stream";

const app = express();

// Endpoint used to return the stream manifest file with signed chunk urls
// This endpoint is a get endpoint without any headers
// Note: Works only for the Media bucket

app.use(corsMiddleware);

app.post("/getVideos", validateUser, videosEndpoints.getVideos);
app.post("/getVideoById", validateUser, videosEndpoints.getVideoById);
app.post("/deleteVideo", strictValidateUser, videosEndpoints.deleteVideo);
app.post("/updateVideoViews", videosEndpoints.updateVideoViews);
app.post("/updateVideoLikesDislikes", strictValidateUser, videosEndpoints.updateVideoLikesDislikes);

// signed stream url will be used in the video src tag so it must be a GET endpoint.
app.get("/getSignedStream", streamEndpoints.getSignedStream);

// use custom service account with storage object sign rule
export const videos = functionsV2.onRequest(
  {
    serviceAccount: `app-url-signer@${process.env.PABOLO_PROJECT_ID}.iam.gserviceaccount.com`,
    region: process.env.PABOLO_FUNCTIONS_REGION,
  },
  app
);
