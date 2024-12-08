import Joi from "joi";
import AcousticEnvironments from "../../../shared/constants/acousticEnvironments";

export interface Dialog {
  dialogId?: string;
  character_id: string; // This is the ID of the speaker character
  line: string;
  line_url?: string;
  line_url_preview?: string;
  emotion?: string;
}

export interface BoundingBox {
  box: number[];
  character_id: string;
}

export interface Shot {
  id: string;
  content: string;
  image_url: string;
  bounding_boxes: BoundingBox[];
  location: number;
  shot_type: number;

  sound: string;
  sound_urls: string[];
  image_url_preview?: string;
  sound_urls_preview?: string[];
  selected_sound_index: number;
  acoustic_env: string;

  dialog: Dialog[];
  video_url?: string;
  duration?: number;

  user_created: boolean;
}

export const DialogSchema = Joi.object<Dialog>({
  dialogId: Joi.string().optional(),
  character_id: Joi.string(),
  line: Joi.string().allow(""),
  line_url: Joi.string().optional(),
  emotion: Joi.string().optional(),
});

export const boundingBoxSchema = Joi.object({
  box: Joi.array().items(Joi.number()),
  character_id: Joi.string(),
});

const ShotSchema = Joi.object<Shot>({
  id: Joi.string(),
  content: Joi.string(),
  image_url: Joi.string().allow("").optional(),
  bounding_boxes: Joi.array().items(boundingBoxSchema).optional(),
  location: Joi.number(),
  shot_type: Joi.number(),

  sound: Joi.string().allow("").optional(),
  sound_urls: Joi.array().items(Joi.string()),
  selected_sound_index: Joi.number(),
  acoustic_env: Joi.string().valid(...Object.values(AcousticEnvironments)),

  dialog: Joi.array().items(DialogSchema),

  user_created: Joi.boolean(),
});

export const ShotsSchema = Joi.array().items(ShotSchema);

export default ShotSchema;
