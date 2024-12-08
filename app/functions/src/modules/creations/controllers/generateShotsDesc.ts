import { Character } from "../../../schema/Character.schema";
import {
  GeneratorRequsest,
  creationGenerator,
  creationGeneratorMethods,
} from "../../../integrations/creationGenerator";
import { Scene } from "../../../schema/Scene.schema";
import { Shot } from "../../../schema/Shot.schema";
import { addIdToItems } from "./addIdToItems";
import { Location } from "../../../schema/Location.schema";

export const generateShotsDesc = async ({
  creationId,
  uid,
  sceneIndex,
  scenes,
  genre,
  attributes,
  audience,
  locations,
  characters,
  isMock,
  req,
}: {
  creationId: string;
  uid: string;
  sceneIndex: number;
  scenes: Scene[];
  genre: number;
  attributes: string[];
  audience: number;
  locations: Location[];
  characters: Character[];
  isMock: boolean;
  req: GeneratorRequsest;
}): Promise<{
  script: string;
  shots: Array<Omit<Shot, "user_created">>;
}> => {
  const { script } = await creationGenerator(
    creationGeneratorMethods.GET_SCRIPT,
    {
      cid: creationId,
      uid,
      scenes,
      scene_id: sceneIndex,
      genre,
      attributes,
      audience,
      locations,
      characters,
    },
    { isMock, req }
  );

  const { shots } = await creationGenerator(
    creationGeneratorMethods.GET_SHOTS,
    {
      cid: creationId,
      uid,
      script: [script],
      locations,
      characters,
      scene: 0,
    },
    { isMock, req }
  );

  return { script, shots: addIdToItems(shots) };
};
