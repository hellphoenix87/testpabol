import Joi from "joi";
import CreationMetaSchema from "../../../schema/CreationMeta.schema";
import SceneSchema from "../../../schema/Scene.schema";
import TitlePlotSchema from "../../../schema/TitlePlot.schema";
import {
  GeneratorRequsest,
  creationGenerator,
  creationGeneratorMethods,
} from "../../../integrations/creationGenerator";
import { validateSchemaWithErrorHandler } from "../../../utils/validation";
import { Character } from "../../../schema/Character.schema";
import { Location } from "../../../schema/Location.schema";
import { MAX_SCENES_COUNT } from "../../../../../shared";
import { addIdToItems } from "./addIdToItems";

export const getCharactersAndLocationsFromGenerator = async ({
  creationId,
  uid,
  isMock,
  req,
  ...data
}: {
  creationId: string;
  uid: string;
  isMock: boolean;
  req: GeneratorRequsest;
  title: string;
  scenes: Array<any>;
  genre: number;
  audience: number;
  attributes: Array<string>;
}): Promise<{
  characters: Character[];
  locations: Location[];
}> => {
  const title = validateSchemaWithErrorHandler(data, TitlePlotSchema);
  const scenes = validateSchemaWithErrorHandler(data.scenes, Joi.array().items(SceneSchema).max(MAX_SCENES_COUNT));
  const creationData = validateSchemaWithErrorHandler(data, CreationMetaSchema);
  const validData = { scenes, cid: creationId, uid };
  const config = { isMock, req };

  const [{ characters }, { locations }] = await Promise.all([
    creationGenerator(creationGeneratorMethods.GET_CHARACTERS, { ...creationData, ...validData }, config),
    creationGenerator(creationGeneratorMethods.GET_LOCATIONS, { ...title, ...validData }, config),
  ]);

  return { characters, locations: addIdToItems(locations) };
};
