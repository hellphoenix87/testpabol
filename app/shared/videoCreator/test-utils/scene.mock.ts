import { Scene } from "../interfaces";

export const sceneMockFactory = (): Scene => {
  return {
    shots: [
      {
        shot_type: 1,
        selected_sound_index: 0,
        sound_urls: ["mock-sound-url"],
        sound: "mock-sound-string",
        location: 0,
        content: "mock-shot-content",
        dialog: [{ line: "mock-dialog-line", line_url: "mock-dialog-url", character_id: "char_id" }],
        image_url: "mock-image-url",
        acoustic_env: "hall",
        video_url: "mock-video-url",
        duration: 1000,
        bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
      },
      {
        shot_type: 1,
        selected_sound_index: 1,
        sound_urls: ["mock-sound-url", "mock-sound-url-2"],
        sound: "mock-sound-string",
        location: 0,
        content: "mock-shot-content",
        dialog: [{ line: "mock-dialog-line", line_url: "mock-dialog-url", character_id: "char_id" }],
        image_url: "mock-image-url",
        acoustic_env: "hall",
        video_url: "mock-video-url",
        duration: 1000,
        bounding_boxes: [{ box: [1, 2, 3, 4], character_id: "char_id" }],
      },
    ],
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
