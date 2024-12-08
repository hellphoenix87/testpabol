import Joi from "joi";
import { MAX_USER_TEXT_LENGTH } from "../../../shared/constants/fieldsLengthValidation";
export type AnimatedShots = Record<string, { video_url: string; isGenerated: boolean; duration: number }>;

export interface CreationMeta {
  attributes: string[];
  genre: number;
  audience: number;
  userText: string;
  summary?: string;
  charactersOrder?: string[];
  locationsOrder?: string[];
  scenes_order?: string[];
  completed?: boolean;
  maxStep?: number;
  animatedShots?: AnimatedShots;
}

const CreationMetaSchema = Joi.object<CreationMeta>({
  attributes: Joi.array().items().min(0).max(15).optional(),
  genre: Joi.number().min(0).max(18).required(),
  audience: Joi.number().min(0).max(3).required(),
  userText: Joi.string().min(0).max(MAX_USER_TEXT_LENGTH).optional(),
  summary: Joi.string().min(0).max(800).optional(),
  charactersOrder: Joi.array().items(Joi.string()).optional(),
  locationsOrder: Joi.array().items(Joi.string()).optional(),
  scenes_order: Joi.array().items(Joi.string()).optional(),
  completed: Joi.boolean().optional(),
  maxStep: Joi.number().optional(),
  animatedShots: Joi.object().optional(),
});

export default CreationMetaSchema;
