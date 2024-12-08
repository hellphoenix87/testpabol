import Joi from "joi";
import { BadRequestException } from "../helpers";
import { logger } from "firebase-functions";

const validationOptions = {
  abortEarly: false, // Check all fields
  allowUnknown: true, // Allow unknown fields
};

// Validate the schema
export const validateSchema = <T>(objToValidate: T, schema: Joi.Schema): T => {
  const schemaWithOptions = schema.options({ stripUnknown: true }).custom((value, helpers) => {
    // Check if the object is empty
    if (Object.keys(value).length === 0) {
      return helpers.error("object.empty");
    }
    return value;
  }, "Empty Object Validation");

  return Joi.attempt(objToValidate, schemaWithOptions, validationOptions);
};

// TODO: merge the handler wrapper in the main method when all functions use the handler.
export const validateSchemaWithErrorHandler = <T>(objToValidate: T, schema: Joi.Schema): T => {
  try {
    return validateSchema(objToValidate, schema);
  } catch (e: any) {
    logger.error("Validation error", e.details);
    throw new BadRequestException(e);
  }
};
