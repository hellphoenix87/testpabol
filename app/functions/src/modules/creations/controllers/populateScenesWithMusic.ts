import { NO_MUSIC } from "../../../../../shared";
import { Music, Scene } from "../../../schema/Scene.schema";

export const populateScenesWithMusic = (scenes: Array<Scene>, music: Array<Array<Music | null>>): Array<Scene> => {
  return scenes.map((scene, index) => {
    if (music[index] && music[index][0]) {
      return {
        ...scene,
        musics: music[index],
        music_url: music[index][0]?.id,
        selected_music_index: 0,
      };
    }

    return {
      ...scene,
      musics: [],
      music_desc: "",
      music_url: "",
      selected_music_index: NO_MUSIC,
    };
  });
};
