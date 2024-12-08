import { setSceneData } from "../../../DB/creationRepository";
import {
  GeneratorRequsest,
  creationGenerator,
  creationGeneratorMethods,
} from "../../../integrations/creationGenerator";
import { Character } from "../../../schema/Character.schema";
import { Location } from "../../../schema/Location.schema";
import { Scene } from "../../../schema/Scene.schema";
import { generateShotsDesc } from "./generateShotsDesc";
import { populateCharactersWithVoice } from "./populateCharactersWithVoice";

export const generateShotsResources = async ({
  uid,
  creationId,
  scenes,
  sceneIndex,
  genre,
  tags,
  audience,
  locations,
  characters,
  isMock,
  req,
}: {
  uid: string;
  creationId: string;
  scenes: Scene[];
  sceneIndex: number;
  genre: number;
  tags: string[];
  audience: number;
  locations: Location[];
  characters: Character[];
  isMock: boolean;
  req: GeneratorRequsest;
}) => {
  const scene = scenes[sceneIndex];
  const { script, shots } = await generateShotsDesc({
    creationId,
    uid,
    sceneIndex,
    scenes,
    genre,
    attributes: tags,
    audience,
    locations,
    characters,
    isMock,
    req,
  });

  const resourcesReqParams = {
    cid: creationId,
    uid,
    shots,
    locations,
    characters: populateCharactersWithVoice(characters),
    scene: "*",
  };

  const [{ shot_images: generatedImages }, { shot_speeches: generatedSpeeches }] = await Promise.all([
    creationGenerator(creationGeneratorMethods.GET_SHOT_IMAGES, resourcesReqParams, { isMock, req }),
    creationGenerator(creationGeneratorMethods.GET_SHOT_SPEECHES, resourcesReqParams, { isMock, req }),
  ]);

  const populatedShots = shots.map((shot, shotIndex) => ({
    ...shot,
    image_url: generatedImages[shotIndex].url,
    bounding_boxes: generatedImages[shotIndex].bounding_boxes,
    dialog: shot.dialog.map((line, index) => ({
      ...line,
      line_url: generatedSpeeches[shotIndex][index] || line.line_url,
    })),
  }));

  // Save shots to firebase
  await setSceneData(uid, creationId, { id: scene.id, script, shots: populatedShots as any });

  return { shots: populatedShots, script };
};
