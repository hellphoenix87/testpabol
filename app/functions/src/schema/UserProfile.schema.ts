import Joi from "joi";
import { socialMediaPattern, webPattern } from "../../../shared";

export interface UserProfile {
  uid: string;
  display_name: string;
  email: string;
  avatar_url: string;
  header_url: string;
  about: string;
  location: string;
  web: string;
  twitter: string;
  instagram: string;
  email_comments: boolean;
  is_creator: boolean;
  is_welcomed: boolean;
}

const UserProfileSchema = Joi.object<UserProfile>({
  uid: Joi.string().regex(/^[a-zA-Z0-9]{28}$/),
  display_name: Joi.string(),
  email: Joi.string().email(),
  avatar_url: Joi.string(),
  header_url: Joi.string().allow(null, ""),
  about: Joi.string().allow(null, "").min(20),
  location: Joi.string().allow(null, ""),
  web: Joi.string().allow(null, "").regex(webPattern),
  twitter: Joi.string().allow(null, "").regex(socialMediaPattern),
  instagram: Joi.string().allow(null, "").regex(socialMediaPattern),
  email_comments: Joi.boolean(),
  is_creator: Joi.boolean(),
  is_welcomed: Joi.boolean(),
});

export default UserProfileSchema;
