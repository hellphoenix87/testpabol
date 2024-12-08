import Joi from "joi";
import ShotSchema, { Shot } from "./Shot.schema";

export interface Music {
  id: string;
  id_preview?: string;
}

export interface Scene {
  id: string;
  scene_title: string;
  script?: string;
  desc: string;
  music_desc: string;
  musics?: Array<Music | null>;
  music_url?: string | null;
  selected_music_index?: number;
  user_created?: boolean;
  music_url_preview?: string;

  shots_order?: string[];
  shots?: Shot[];
}

export const MusicSchema = Joi.object<Music>({
  id: Joi.string(),
});

const SceneSchema = Joi.object<Scene>({
  id: Joi.string(),
  scene_title: Joi.string().min(0).allow(null, ""),
  script: Joi.string().min(0).allow(null, "").optional(),
  desc: Joi.string(),
  music_desc: Joi.string().allow(""),
  musics: Joi.array().items(MusicSchema),
  music_url: Joi.string().min(0).allow(null, ""),
  selected_music_index: Joi.number().min(-1).allow(null),
  user_created: Joi.boolean(),
  shots_order: Joi.array().items(Joi.string()),
  shots: Joi.array().items(ShotSchema),
});

export default SceneSchema;
