import { SceneDoc } from "./sceneDoc";
import { Shot } from "./shot";

export interface Scene extends SceneDoc {
  shots?: Shot[];
  id?: string;
  updated_at?: any;
}
