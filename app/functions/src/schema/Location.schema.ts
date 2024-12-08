import Joi from "joi";

export interface Location {
  id: string;
  name: string;
  desc: string;
  user_created?: boolean;
  images: string[];
  images_preview?: string[];
  selected_image_index: number;
}

const LocationSchema = Joi.object<Location>({
  id: Joi.string(),
  name: Joi.string(),
  desc: Joi.string(),
  user_created: Joi.boolean(),
  images: Joi.array().items(Joi.string()).min(0).max(3),
  selected_image_index: Joi.number(),
});

export default LocationSchema;
