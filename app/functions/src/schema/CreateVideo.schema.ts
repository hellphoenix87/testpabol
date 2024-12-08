import Joi from "joi";

export const CreateVideoSchema = Joi.object({
  creationId: Joi.string().required(),
  title: Joi.string().required(),
  audience: Joi.number().required(),
  genre: Joi.number().required(),
  tags: Joi.array().items(Joi.string()),
  description: Joi.string().required(),
  selectedThumbnail: Joi.object({
    sceneIndex: Joi.number().required(),
    shotIndex: Joi.string().required(),
    imageUrl: Joi.string().required(),
  }),
  isAgeRestricted: Joi.boolean(),
});
