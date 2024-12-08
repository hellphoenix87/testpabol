import AcousticEnvironments from "../../../shared/constants/acousticEnvironments";
import { Scene } from "../schema/Scene.schema";

export const sceneMockFactory = (): Scene => {
  return {
    shots: [
      {
        id: "mock-shot-id-1",
        shot_type: 1,
        selected_sound_index: 0,
        sound_urls: ["mock-sound-url"],
        sound: "mock-sound-string",
        acoustic_env: AcousticEnvironments.HALL,
        location: 0,
        content: "mock-shot-content",
        dialog: [{ line: "mock-dialog-line", line_url: "mock-dialog-url", character_id: "mock-char-id" }],
        image_url: "mock-image-url",
        bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
        user_created: true,
      },
      {
        id: "mock-shot-id-2",
        shot_type: 1,
        selected_sound_index: 1,
        sound_urls: ["mock-sound-url", "mock-sound-url-2"],
        sound: "mock-sound-string",
        acoustic_env: AcousticEnvironments.OUTSIDE,
        location: 0,
        content: "mock-shot-content",
        dialog: [{ line: "mock-dialog-line", line_url: "mock-dialog-url", character_id: "mock-char-id" }],
        image_url: "mock-image-url",
        bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
        user_created: true,
      },
    ],
    user_created: true,
    id: "mock-scene-id",
    music_desc: "mock-music-desc",
    selected_music_index: 0,
    music_url: "mock-music-url",
    musics: [
      {
        id: "mock-music-id",
      },
    ],
    desc: "mock-desc",
    scene_title: "mock-scene-title",
  };
};
