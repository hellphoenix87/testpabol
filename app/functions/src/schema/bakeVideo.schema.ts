import Joi from "joi";
import { CreateVideoSchema } from "./CreateVideo.schema";

enum MimeTypesEnum {
  "image/png" = "image/png",
  "image/jpeg" = "image/jpeg",
}

export const CookVideoSchema = Joi.object({
  creationId: Joi.string().required(),
  uid: Joi.string(),
  videoDetails: CreateVideoSchema,
  mimeType: Joi.string().valid(...Object.keys(MimeTypesEnum)),
  regenerate: Joi.boolean(),
  isMock: Joi.boolean(),
});

export const BakeVideoSchema = Joi.object({
  creationId: Joi.string().required(),
  uid: Joi.string(),
  mimeType: Joi.string().valid(...Object.keys(MimeTypesEnum)),
  part: Joi.number(),
  isMock: Joi.boolean(),
});
