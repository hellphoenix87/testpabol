import { Music } from "./music";

export interface SceneDoc {
  music_desc?: string | null;
  selected_music_index?: number;
  music_url?: string | null;
  musics?: Array<Music | null>;
  desc: string | null;
  scene_title: string | null;
}
