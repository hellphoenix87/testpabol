import express from "express";
import { validateBody, validateUser } from "../../middlewares";
import corsMiddleware from "../../middlewares/cors";
import * as endpoints from "./endpoints";
import * as functionsV2 from "firebase-functions/v2/https";
import { onMessagePublished } from "firebase-functions/v2/pubsub";
import { ONE_HOUR, ONE_MINUTE, TWO_GIG } from "../../constants/functionsConfig";
import { BakeVideoSchema, CookVideoSchema } from "../../schema/bakeVideo.schema";

const SERVICE_ACCOUNT = `app-kitchen@${process.env.PABOLO_PROJECT_ID}.iam.gserviceaccount.com`;

const app = express();
app.use(corsMiddleware);

app.post("/bakeVideo", [validateUser, validateBody(BakeVideoSchema)], endpoints.bakeVideo);
app.post("/cookVideo", [validateUser, validateBody(CookVideoSchema)], endpoints.cookVideo);

export const KitchenPubSub = onMessagePublished(
  {
    serviceAccount: SERVICE_ACCOUNT,
    topic: process.env.PABOLO_TOPIC_RESPONSE_VIDEOGEN || "",
    timeoutSeconds: 9 * ONE_MINUTE,
    eventFilters: {
      attribute: "commit_hash",
      value: process.env.__COMMIT_HASH__ || "",
    },
  },
  async event => {
    const message = event.data.message;
    const data = message.data ? JSON.parse(Buffer.from(message.data, "base64").toString()) : null;

    return await endpoints.animateVideoPart({
      data,
      attributes: event.data.message.attributes,
    });
  }
);

export default functionsV2.onRequest(
  {
    timeoutSeconds: ONE_HOUR,
    memory: TWO_GIG,
    maxInstances: 1000,
    concurrency: 1,
    region: process.env.PABOLO_FUNCTIONS_REGION as string,
    serviceAccount: SERVICE_ACCOUNT,
  },
  app
);
