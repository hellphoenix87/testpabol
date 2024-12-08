import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { ReverbsFiles } from "../../constants";
import { applyReverb } from "../ffmpeg";
import { getAcousticEnvEqualisationSettings } from "../generateVideoFile";

if (!process.env.CI) {
  // Import the .env file if the test is running locally
  const envFilePath = path.join(__dirname + "../../../../.env");
  dotenv.config({ path: envFilePath });
} else {
  dotenv.config();
}

const getLocalReverbFiles = (): Record<string, string> => {
  const localReverbFiles: Record<string, string> = {};

  for (const environmentName of Object.keys(ReverbsFiles)) {
    const environment = ReverbsFiles[environmentName];

    localReverbFiles[environmentName] = path.join(__dirname, "../../../functions", environment.path);
  }

  return localReverbFiles;
};

describe("generate acoustic env examples", () => {
  const REVERB_RESULTS_DIRECTORY = "acousticEnvResults";
  let localReverbFiles: Record<string, string>;

  beforeAll(() => {
    const acousticEnvResultsDir = path.join(__dirname, REVERB_RESULTS_DIRECTORY);

    if (!fs.existsSync(acousticEnvResultsDir)) {
      fs.mkdirSync(acousticEnvResultsDir);
    }

    localReverbFiles = getLocalReverbFiles();
  });

  it(
    "should apply acoustic audio effects",
    async () => {
      const audioFile = path.resolve(__dirname, "./original-voice.mp3");

      for (const [name, reverb] of Object.entries(ReverbsFiles)) {
        const output = await applyReverb({
          audioFile,
          reverbFile: localReverbFiles[name],
          dryLevel: reverb.dryLevel,
          equalizationSettings: getAcousticEnvEqualisationSettings(name),
          duration: 5,
        });

        const newName = path.join(__dirname, REVERB_RESULTS_DIRECTORY, `voice-${name}.ogg`);
        fs.copyFileSync(output, newName);
      }
    },
    60 * 1000 // 1 minute timeout
  );
});
