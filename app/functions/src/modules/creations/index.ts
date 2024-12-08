import express from "express";
import { strictValidateUser } from "../../middlewares/validateUser";
import corsMiddleware from "../../middlewares/cors";
import * as creationsEndpoints from "./endpoints/creations";
import * as titleAndMetadataEndpoints from "./endpoints/titleAndMetadata";
import * as scenesEndpoints from "./endpoints/scenes";
import * as summaryEndpoints from "./endpoints/summary";
import * as functionsV2 from "firebase-functions/v2/https";

const MAX_FUNCTIONS_TIMEOUT = 540;

const app = express();

app.use(corsMiddleware);

// Common creation routes
app.post("/getCreations", strictValidateUser, creationsEndpoints.getCreations);
app.post("/deleteCreation", strictValidateUser, creationsEndpoints.deleteCreation);
app.post("/finishCreation", strictValidateUser, creationsEndpoints.finishCreation);
app.post("/setMaxStep", strictValidateUser, creationsEndpoints.setMaxStep);

// Title, plot and metadata routes
app.post("/generateTitleAndPlot", strictValidateUser, titleAndMetadataEndpoints.generateTitleAndPlot);
app.post("/getCreationTitlePlotMeta", strictValidateUser, titleAndMetadataEndpoints.getCreationTitlePlotMeta);
app.post("/saveTitle", strictValidateUser, titleAndMetadataEndpoints.saveTitleToFirestore);

// Scenes routes
app.post("/getScenes", strictValidateUser, scenesEndpoints.getScenes);
app.post("/saveScenes", strictValidateUser, scenesEndpoints.saveScenes);
app.post("/generateMovie", strictValidateUser, scenesEndpoints.generateMovie);

// Summary routes
app.post("/updateSummary", strictValidateUser, summaryEndpoints.updateSummary);
app.post("/generateSummary", strictValidateUser, summaryEndpoints.generateSummary);

// use custom service account with storage object sign rule
export const creations = functionsV2.onRequest(
  {
    timeoutSeconds: MAX_FUNCTIONS_TIMEOUT,
    serviceAccount: `app-url-signer@${process.env.PABOLO_PROJECT_ID}.iam.gserviceaccount.com`,
    region: process.env.PABOLO_FUNCTIONS_REGION,
  },
  app
);
