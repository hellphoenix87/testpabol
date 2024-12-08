import cors from "cors";

const projectId = process.env.PABOLO_PROJECT_ID;

const LOCALHOST_REGEX = /^http:\/\/localhost:\d+$/;
const PABOLO_AI_REGEX = /^https:\/\/(?:www\.)?pabolo\.ai$/;
const ENV_CHANNEL_APP_REGEX = new RegExp(`^https://${projectId}.web.app$`);
const ENV_CHANNEL_FIREBASE_APP_REGEX = new RegExp(`^https://${projectId}.firebaseapp.com$`);
const ENV_CHANNEL_BACKOFFICE_REGEX = new RegExp(`^https://backoffice-${projectId}.web.app$`);
const ENV_CHANNEL_FIREBASE_BACKOFFICE_REGEX = new RegExp(`^https://backoffice-${projectId}.firebaseapp.com$`);
const PREVIEW_CHANNEL_APP_REGEX = new RegExp(`^https://${projectId}--.*.web.app$`);
const PREVIEW_CHANNEL_BACKOFFICE_REGEX = new RegExp(`^https://backoffice-${projectId}--.*.web.app$`);

const allowedOrigins = [
  LOCALHOST_REGEX,
  PABOLO_AI_REGEX,
  ENV_CHANNEL_APP_REGEX,
  ENV_CHANNEL_FIREBASE_APP_REGEX,
  ENV_CHANNEL_BACKOFFICE_REGEX,
  ENV_CHANNEL_FIREBASE_BACKOFFICE_REGEX,
  PREVIEW_CHANNEL_APP_REGEX,
  PREVIEW_CHANNEL_BACKOFFICE_REGEX,
];

const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ["POST"], // only allow POST requests because we only use post requests in our microservices
});

export default corsMiddleware;
