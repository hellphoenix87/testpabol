import fs from "fs";
import path from 'path';
import {
  mockBackendUrl,
  defaultBackendUrl,
  commitHash,
} from "../globalConfig.js";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const credentials = fs.existsSync("../sa_key.json") ? path.resolve("../sa_key.json") : "";

// share the commit hash with functions: the file-based propagation suits Cloud Functions deployment
const globalEnv =
  [
    `__COMMIT_HASH__="${commitHash}"`,
    `__MOCKED_GENERATOR_API__="${mockBackendUrl}"`,
    `__DEFAULT_GENERATOR_API__="${defaultBackendUrl}"`,
    `PABOLO_TOPIC_GCP_PROJECT="${process.env.PABOLO_TOPIC_GCP_PROJECT}"`,
    `PABOLO_TOPIC_RESPONSE_VIDEOGEN="${process.env.PABOLO_TOPIC_RESPONSE_VIDEOGEN}"`,
    `SA_CREDENTIALS="${credentials}"`,
    `PABOLO_BUCKET_NAME_MEDIA_STORAGE="${process.env.PABOLO_BUCKET_NAME_MEDIA_STORAGE}"`,
    `PABOLO_BUCKET_NAME_PUBLIC_STORAGE="${process.env.PABOLO_BUCKET_NAME_PUBLIC_STORAGE}"`,
    `PABOLO_BUCKET_NAME_SOUND_STORAGE="${process.env.PABOLO_BUCKET_NAME_SOUND_STORAGE}"`,
    `PABOLO_BUCKET_NAME_MUSIC_STORAGE="${process.env.PABOLO_BUCKET_NAME_MUSIC_STORAGE}"`,
    `PABOLO_BUCKET_NAME_ASSET_STORAGE="${process.env.PABOLO_BUCKET_NAME_ASSET_STORAGE}"`,
    `PABOLO_BUCKET_NAME_VOICE_STORAGE="${process.env.PABOLO_BUCKET_NAME_VOICE_STORAGE}"`,
    `PABOLO_BUCKET_PUBLIC_CDN="${process.env.PABOLO_BUCKET_PUBLIC_CDN}"`,
    `PABOLO_PROJECT_ID="${process.env.PABOLO_PROJECT_ID}"`,
    `PABOLO_FUNCTIONS_REGION="${process.env.PABOLO_FUNCTIONS_REGION}"`,
  ].join("\n") + "\n";

console.log("globalEnv:\n" + globalEnv);

fs.writeFileSync("./.env", globalEnv);
