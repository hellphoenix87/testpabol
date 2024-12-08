import express from "express";
import admin from "firebase-admin";
import { validateSchemaWithErrorHandler } from "../../utils/validation";
import UserProfileSchema from "../../schema/UserProfile.schema";
import {
  BadRequestException,
  NotAllowedException,
  NotFoundException,
  isEmail,
  throwExpressError,
} from "../../helpers";
import { getRandomAvatarImage } from "../../utils/utils";
import { HttpStatusCodes } from "../../constants/httpStatusCodes";
import { sendEmailToEmailAddress, EmailTemplates } from "../../utils/email";

/**
 update user profile.
*/
export const saveUserProfile = async (req: express.Request, res: express.Response) => {
  const currentUserId = req.user?.uid;
  try {
    if (!currentUserId) {
      throw new BadRequestException("Invalid User!");
    }
    if (req.body.uid !== currentUserId) {
      throw new NotAllowedException("Attempt to save profile of another user.");
    }
    if (req.body.email && !isEmail(req.body.email)) {
      throw new BadRequestException("Invalid email!");
    }

    const validatedData = validateSchemaWithErrorHandler(req.body, UserProfileSchema);

    await admin.firestore().collection("users").doc(currentUserId).set(validatedData, { merge: true });
    return res.status(HttpStatusCodes.OK).json({ message: "User profile successfully saved" });
  } catch (e: any) {
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: "Failed to save user profile",
    });
  }
};

/**
 deletes the current user.
*/
export const deleteCurrentUser = async (req: express.Request, res: express.Response) => {
  try {
    const currentUserId = req.user?.uid;
    if (!currentUserId) {
      throw new BadRequestException("Invalid User!");
    }

    // delete the user
    await admin.auth().deleteUser(currentUserId);
    return res.status(HttpStatusCodes.OK).json({ message: "User successfully deleted" });
  } catch (e: any) {
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: "Failed to delete the user.",
    });
  }
};

/**
 get the user profile by id.
*/

export const getUserProfile = async (req: express.Request, res: express.Response) => {
  const uid = req.body.uid;
  try {
    if (!uid) {
      throw new BadRequestException("Invalid UID!");
    }
    const doc = await admin.firestore().collection("users").doc(uid).get();

    if (!doc.exists) {
      throw new NotFoundException();
    }
    return res.status(HttpStatusCodes.OK).json(doc.data());
  } catch (e: any) {
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: "Failed to get user profile",
    });
  }
};

/**
 get a random avatar url.
*/

export const getRandomAvatarImageUrl = async (req: express.Request, res: express.Response) => {
  const url = await getRandomAvatarImage();
  return res.json({ url });
};

export const sendVerificationEmail = async (req: express.Request, res: express.Response) => {
  const currentUserId = req.user?.uid;
  const email = req.body?.email;
  try {
    let user: admin.auth.UserRecord;
    if (currentUserId) {
      user = await admin.auth().getUser(currentUserId);
    } else {
      if (!email) {
        throw new BadRequestException("Email not provided!");
      }
      user = await admin.auth().getUserByEmail(email);
    }
    if (!user) {
      throw new NotFoundException("User not found!");
    }
    if (user.emailVerified) {
      throw new NotAllowedException("Email already verified!");
    }

    const originUrl = req.headers.origin as string;
    const verificationLink = await admin.auth().generateEmailVerificationLink(user.email as string, {
      url: originUrl,
    });

    await sendEmailToEmailAddress({
      template: EmailTemplates.VERIFICATION_EMAIL,
      emailAdress: user?.email,
      subject: "Verify your email for Pabolo.ai",
      variables: {
        verificationLink,
      },
    });

    return res.status(HttpStatusCodes.OK).json({ message: "Verification email sent successfully" });
  } catch (e: any) {
    return throwExpressError({
      res,
      error: e,
      internalErrorMessage: "Failed to send verification email",
    });
  }
};
