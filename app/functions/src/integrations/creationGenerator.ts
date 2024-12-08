import axios from "axios";
import dotenv from "dotenv";
import Joi from "joi";
import { logger } from "firebase-functions/v1";
import CharacterSchema, { Character } from "../schema/Character.schema";
import LocationSchema, { Location } from "../schema/Location.schema";
import SceneSchema, { Music, MusicSchema, Scene } from "../schema/Scene.schema";
import ShotSchema, { Shot, boundingBoxSchema } from "../schema/Shot.schema";
import { generateToken } from "../utils/googleAuth";

export interface GeneratorRequsest {
  headers: { authorization?: string };
}

dotenv.config();

const FORBIDDEN_SHOT_PROPERTIES = ["id", "user_created"];
const FORBIDDEN_SCENES_PROPERTIES = [
  "id",
  "scene_title",
  "musics",
  "music_url",
  "selected_music_index",
  "user_created",
  "shots_order",
  "shots",
];
const FORBIDDEN_CHARACTER_PROPERTIES = ["user_created"];
const FORBIDDEN_LOCATION_PROPERTIES = ["id", "user_created"];

export enum creationGeneratorMethods {
  GET_SHOT_SPEECHES = "get_shot_speeches",
  GET_SHOT_IMAGES = "get_shot_images",
  GET_SHOTS = "get_shots",
  GET_MUSIC = "get_music",
  GET_SUMMARY = "get_summary",
  GET_SCRIPT = "get_script",
  GET_CHARACTERS = "get_characters",
  GET_LOCATIONS = "get_locations",
  GET_TITLE_PLOT = "get_title_plot",
}

const shotImageSchema = Joi.object({
  url: Joi.string(),
  bounding_boxes: Joi.array().items(boundingBoxSchema),
});

export const mapMethodToValidationSchema: Record<creationGeneratorMethods, Joi.Schema | null> = {
  [creationGeneratorMethods.GET_SHOT_SPEECHES]: Joi.object({
    shot_speeches: Joi.array().items(Joi.array().items(Joi.string())),
  }),
  [creationGeneratorMethods.GET_SHOT_IMAGES]: Joi.object({ shot_images: Joi.array().items(shotImageSchema) }),
  [creationGeneratorMethods.GET_SHOTS]: Joi.object({
    shots: Joi.array().items(ShotSchema.fork(FORBIDDEN_SHOT_PROPERTIES, schema => schema.forbidden())),
  }),
  [creationGeneratorMethods.GET_MUSIC]: Joi.object({
    music: Joi.array().items(Joi.array().items(MusicSchema).allow(null)),
  }),
  [creationGeneratorMethods.GET_SUMMARY]: Joi.object({ summary: Joi.string() }),
  [creationGeneratorMethods.GET_CHARACTERS]: Joi.object({
    characters: Joi.array().items(CharacterSchema.fork(FORBIDDEN_CHARACTER_PROPERTIES, schema => schema.forbidden())),
  }),
  [creationGeneratorMethods.GET_LOCATIONS]: Joi.object({
    locations: Joi.array().items(LocationSchema.fork(FORBIDDEN_LOCATION_PROPERTIES, schema => schema.forbidden())),
  }),
  [creationGeneratorMethods.GET_TITLE_PLOT]: Joi.object({
    title: Joi.string(),
    scenes: Joi.array().items(SceneSchema.fork(FORBIDDEN_SCENES_PROPERTIES, schema => schema.forbidden())),
  }),
  [creationGeneratorMethods.GET_SCRIPT]: Joi.object({ script: Joi.string() }),
};

export const validateResponse = <T = any>(dataToCheck: T, method: creationGeneratorMethods): T => {
  const schema = mapMethodToValidationSchema[method];

  if (!schema) {
    return dataToCheck;
  }

  const schemaWithOptions = schema.custom((value, helpers) => {
    // Check if the object is empty
    if (Object.keys(value).length === 0) {
      return helpers.error("object.empty");
    }
    return value;
  }, "Empty Object Validation");

  try {
    return Joi.attempt(dataToCheck, schemaWithOptions, { presence: "required", abortEarly: false });
  } catch (error) {
    logger.error({
      message: `Validation of the response failed for method ${method}`,
      data: dataToCheck,
    });
    throw error;
  }
};

export async function creationGenerator(
  call: creationGeneratorMethods.GET_SHOT_SPEECHES,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ shot_speeches: string[][] }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_SHOT_IMAGES,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ shot_images: { url: string; bounding_boxes: { box: number[]; character_id: string }[] }[] }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_SHOTS,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ shots: Array<Omit<Shot, "id" | "user_created">> }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_MUSIC,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ music: Array<Array<Music | null>> }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_SUMMARY,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ summary: string }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_CHARACTERS,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ characters: Array<Omit<Character, "user_created">> }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_LOCATIONS,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ locations: Array<Omit<Location, "id" | "user_created">> }>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_TITLE_PLOT,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{
  title: string;
  scenes: Array<
    Omit<
      Scene,
      "id" | "scene_title" | "musics" | "music_url" | "selected_music_index" | "user_created" | "shots_order" | "shots"
    >
  >;
}>;

export async function creationGenerator(
  call: creationGeneratorMethods.GET_SCRIPT,
  body: Record<string, any>,
  config: { isMock?: boolean; req: GeneratorRequsest }
): Promise<{ script: string }>;

export async function creationGenerator<T = any>(
  call: creationGeneratorMethods,
  body: Record<string, any>,
  { isMock = true }: { isMock?: boolean; req: GeneratorRequsest }
): Promise<T> {
  const url = isMock ? process.env.__MOCKED_GENERATOR_API__ : process.env.__DEFAULT_GENERATOR_API__;

  logger.log({
    message: `Make request to creationGenerator for method ${call} calling URL ${url}`,
    body,
    isMock,
  });

  try {
    const headers: Record<string, string> = {};
    const mediaIdsURL = new URL(url!);
    const token = await generateToken(mediaIdsURL.origin);
    headers.Authorization = `Bearer ${token}`;

    const { data } = await axios.post<T>(
      url!,
      { ...body, call },
      {
        headers,
      }
    );
    logger.log({ message: `creationGenerator response for method ${call} calling URL ${url}`, data });

    return validateResponse(data, call);
  } catch (error: any) {
    logger.error(`creationGenerator failed for method ${call} calling URL ${url}`, error.response?.data || error);
    throw new Error("Error during generating data");
  }
}
