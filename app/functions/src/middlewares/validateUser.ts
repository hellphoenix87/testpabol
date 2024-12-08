import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { User } from "../types/User";
import { HttpStatusCodes } from "../constants/httpStatusCodes";
import { Collections } from "../constants/collections";

// Middleware to check if user is authenticated and has a valid token
// This middleware should be used when authentication is optional
export const validateUser = async (req: Request, res: Response, next: NextFunction) => {
  if (req?.headers?.authorization && req.headers.authorization.startsWith("Bearer ")) {
    const authToken = req.headers.authorization.split("Bearer ")[1];

    try {
      const verifiedToken = await admin.auth().verifyIdToken(authToken);

      if (verifiedToken) {
        const user = await admin.firestore().collection("users").doc(verifiedToken.uid).get();
        req.uid = verifiedToken.uid;
        if (user.exists) {
          req.user = user.data() as User;
        }
      }
    } catch (e) {
      logger.error("Invalid auth token provided", e);
    }
  }
  next();
};

// Middleware to check if user is authenticated and has a valid token, it will return a 401 if not
// This middleware should be used when authentication is strictly required
export const strictValidateUser = async (req: Request, res: Response, next: NextFunction) => {
  // function calls unauthorized if no token is provided
  const unauthorized = (msg: string) => {
    logger.error(msg);
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  };

  if (!req?.headers?.authorization || !req.headers.authorization.startsWith("Bearer ")) {
    unauthorized(
      "The key 'authorization' was not found in the request headers or the value did not start with 'Bearer '"
    );
    return;
  }

  const authToken = req.headers.authorization.split("Bearer ")[1];

  try {
    const verifiedToken = await admin.auth().verifyIdToken(authToken);

    if (!verifiedToken) {
      unauthorized("Invalid auth token provided");
      return;
    }

    const user = await admin.firestore().collection(Collections.USERS).doc(verifiedToken.uid).get();

    if (!user.exists) {
      unauthorized("User does not exist");
      return;
    }

    req.user = user.data() as User;

    next();
  } catch (e) {
    logger.error("Invalid auth token provided", e);
    res.status(HttpStatusCodes.UNAUTHORIZED).json({ error: "Unauthorized" });
  }
};
