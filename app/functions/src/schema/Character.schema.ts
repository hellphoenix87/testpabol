import Joi from "joi";

export interface Character {
  id: string;
  name: string;
  desc: string;
  role: string;
  voice_desc: string;
  voice_sample_urls: string[];
  voice_sample_urls_preview?: string[];
  voices: number[];
  selected_voice_index: number;
  user_created?: boolean;
  images: string[];
  embedding_ids: number[];
  images_preview?: string[];
  selected_image_index: number;
  pitch?: number;
}

const CharacterSchema = Joi.object<Character>({
  id: Joi.string(),
  name: Joi.string(),
  desc: Joi.string().allow(""),
  role: Joi.string().allow("").optional(),
  voice_desc: Joi.string().allow("").optional(),
  voice_sample_urls: Joi.array().items(Joi.string()).min(0).max(3),
  voices: Joi.array().items(Joi.number()).min(0).max(3),
  selected_voice_index: Joi.number(),
  user_created: Joi.boolean(),
  images: Joi.array().items(Joi.string()).min(0).max(3).optional(),
  embedding_ids: Joi.array().items(Joi.number()).min(0).max(3),
  selected_image_index: Joi.number().optional(),
  pitch: Joi.number().optional(), // Used for voice attribution, cannot be changed by user
});

export default CharacterSchema;
