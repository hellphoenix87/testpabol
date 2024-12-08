import * as functions from "firebase-functions";
import express from "express";
import { strictValidateUser, validateUser } from "../../middlewares/validateUser";
import corsMiddleware from "../../middlewares/cors";
import * as endpoints from "./endpoints";

const app = express();
app.use(corsMiddleware);

app.post("/saveUserProfile", strictValidateUser, endpoints.saveUserProfile);
app.post("/getUserProfile", validateUser, endpoints.getUserProfile);
app.post("/getRandomAvatarImageUrl", validateUser, endpoints.getRandomAvatarImageUrl);
app.post("/sendVerificationEmail", validateUser, endpoints.sendVerificationEmail);
app.post("/deleteCurrentUser", strictValidateUser, endpoints.deleteCurrentUser);

export default functions.region(process.env.PABOLO_FUNCTIONS_REGION as string).https.onRequest(app);
