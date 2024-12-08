export interface Shot {
  id?: string;
  shot_type: number;
  selected_sound_index: number;
  sound_urls: string[];
  sound: string;
  location: number;
  content: string;
  dialog: { line: string; line_url?: string; character_id?: string; emotion?: string }[];
  updated_at?: any;
  image_url: string;
  acoustic_env: string;
  video_url?: string;
  duration?: number;
  bounding_boxes?: { box: number[]; character_id: string }[];
}
