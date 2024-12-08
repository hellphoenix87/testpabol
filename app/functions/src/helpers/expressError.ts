import express from "express";
import { logger } from "firebase-functions/v1";
import { HttpStatusCodes } from "../constants/httpStatusCodes";

export class BadRequestException extends Error {
  code: number;
  handledError: string | Record<string, any>;
  constructor(error: string | Record<string, any>) {
    super(typeof error === "string" ? error : "Bad Request");
    this.handledError = error || "Bad Request";
    this.code = HttpStatusCodes.BAD_REQUEST;
  }
}

export class NotAllowedException extends Error {
  code: number;
  handledError: string | Record<string, any>;
  constructor(error: string | Record<string, any>) {
    super(typeof error === "string" ? error : "Not Allowed");
    this.handledError = error || "Not Allowed";
    this.code = HttpStatusCodes.NOT_ALLOWED;
  }
}

export class InternalServerErrorException extends Error {
  code: number;
  error: string | Record<string, any>;
  constructor(error?: string | Record<string, any>) {
    super(typeof error === "string" ? error : "Internal Server Error");
    this.error = error || "Internal Server Error";
    this.code = HttpStatusCodes.INTERNAL_SERVER_ERROR;
  }
}

export class NotFoundException extends Error {
  code: number;
  handledError: string | Record<string, any>;
  constructor(error?: string | Record<string, any>) {
    super(typeof error === "string" ? error : "Not Found");
    this.handledError = error || "Not Found";
    this.code = HttpStatusCodes.NOT_FOUND;
  }
}

export const throwExpressError = ({
  res,
  error,
  internalErrorMessage,
}: {
  res: express.Response;
  error?: any;
  internalErrorMessage?: string;
}) => {
  let errorObject = error;

  if (!error.handledError) {
    logger.error(JSON.stringify(error));
    errorObject = new InternalServerErrorException(internalErrorMessage || "Internal Server Error");
  }

  return res.status(errorObject.code).json({
    message: errorObject.message,
    error: errorObject.handledError,
    statusCode: errorObject.code,
  });
};
