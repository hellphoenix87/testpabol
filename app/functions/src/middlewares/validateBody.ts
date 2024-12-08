import express from "express";
import Joi from "joi";
import { HttpStatusCodes } from "../constants/httpStatusCodes";

const validationOptions = {
  abortEarly: false, // Check all fields
  allowUnknown: true, // Allow unknown fields
};

// Middleware to check if body match the targeted schema
// This middleware should be used to validate the joi schema against body
// The validated properties will replace the old body.
export const validateBody =
  (schema: Joi.Schema) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const schemaWithOptions = schema.options({ stripUnknown: true }).custom((value, helpers) => {
        // Check if the object is empty
        if (Object.keys(value).length === 0) {
          return helpers.error("object.empty");
        }
        return value;
      }, "Empty Object Validation");

      req.body = Joi.attempt(req.body?.data || req.body, schemaWithOptions, validationOptions);
      return next();
    } catch (e: any) {
      return res.status(HttpStatusCodes.BAD_REQUEST).json({
        message: e.message,
        error: e,
        statusCode: HttpStatusCodes.BAD_REQUEST,
      });
    }
  };
