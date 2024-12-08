import * as functions from "firebase-functions";
import express from "express";

import { strictValidateUser } from "../../middlewares/validateUser";
import corsMiddleware from "../../middlewares/cors";

import * as usersEndpoints from "./endpoints/users";
import * as videosEndpoints from "./endpoints/videos";

const app = express();

app.use(corsMiddleware);

// Users routes
app.post("/getUsers", strictValidateUser, usersEndpoints.getUsers);
app.post("/getUserById", strictValidateUser, usersEndpoints.getUserById);
app.post("/deleteUserByID", strictValidateUser, usersEndpoints.deleteUserByID);
app.post("/changeAgeRestrictionFlag", strictValidateUser, usersEndpoints.changeAgeRestrictionFlag);
app.post("/updateUserAccesstoCreator", strictValidateUser, usersEndpoints.updateUserAccesstoCreator);

// Videos routes
app.post("/getVideos", strictValidateUser, videosEndpoints.getVideos);
app.post("/getVideoById", strictValidateUser, videosEndpoints.getVideoById);
app.post("/deleteVideo", strictValidateUser, videosEndpoints.deleteVideo);
app.post("/acceptVideo", strictValidateUser, videosEndpoints.acceptVideo);
app.post("/refuseVideo", strictValidateUser, videosEndpoints.refuseVideo);
app.post("/getVideosReports", strictValidateUser, videosEndpoints.getVideosReports);

export const backoffice = functions.region(process.env.PABOLO_FUNCTIONS_REGION!).https.onRequest(app);
