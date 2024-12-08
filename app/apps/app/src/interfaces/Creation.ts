import Scene from "./Scene";

export default interface Creation {
  id: string;
  title?: string;
  genre?: number;
  audience?: number;
  attributes?: string[];
  userText?: string;
  summary?: string;

  scenes?: Scene[];

  thumbnail_images_url?: string[];

  maxStep: number;

  completed?: boolean;

  created_at?: any;
  updated_at?: any;
}
