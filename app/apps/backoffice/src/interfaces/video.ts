interface Video {
  id: string;
  title: string;
  description: string;
  checked_by_moderation: boolean;
  views: number;
  software_version: string;
  likes: number;
  dislikes: number;
  status: string;
  audience: number;
  genre: number;
  deleted: boolean;
  tags: string[];
  thumbnail_images_url: string[];
  refuse_reason: { selected_reason: string; text: string };
  isAgeRestricted?: boolean;

  userInteraction?: {
    action: string;
  };

  author: string;
  avatar_url: string;
  author_name: string | null;

  accepted?: boolean;
  url?: string;
  duration?: number;

  created_at?: any;
  updated_at?: any;
}

export default Video;
