import { logger } from "firebase-functions/v1";
import { setScenesData } from "../../../DB/creationRepository";
import {
  creationGenerator,
  creationGeneratorMethods,
  GeneratorRequsest,
} from "../../../integrations/creationGenerator";
import { Scene } from "../../../schema/Scene.schema";
import { populateScenesWithMusic } from "./populateScenesWithMusic";

export const generateMusic = async ({
  uid,
  creationId,
  scenes,
  isMock,
  req,
}: {
  uid: string;
  creationId: string;
  scenes: Scene[];
  isMock?: boolean;
  req: GeneratorRequsest;
}) => {
  logger.log("generateMusic: call creationGenerator");
  const { music } = await creationGenerator(
    creationGeneratorMethods.GET_MUSIC,
    { scenes, cid: creationId, scene: "*", uid },
    { isMock, req }
  );

  logger.log("generateMusic: call setScenesData");
  await setScenesData(uid, creationId, populateScenesWithMusic(scenes, music));
  logger.log("generateMusic: call setScenesData done");
};
