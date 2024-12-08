export default interface Scene {
  id: string;

  scene_title?: string | null;
  desc: string | null;

  created_at?: Date;
  updated_at?: Date;
}
