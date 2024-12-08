import { logger } from "firebase-functions/v1";
import path from "path";
import fs from "fs";
import ejs from "ejs";

import { getUserData } from "../DB/usersCollection";
import { Attachment, addMail } from "../DB/mailCollection";
import { getFilePath } from "./utils";

enum AttachmentsFilesNames {
  TERMS_OF_USE = "TERMS_OF_USE",
}

/**
 * Enum for attachments files.
 * @readonly
 * @property {string} filename - The file name that will be visible in the email sent to the user.
 * @property {string} path - The name of the attachment file under docs/ folder.
 */
export const AttachmentsFiles: Record<AttachmentsFilesNames, Attachment> = {
  [AttachmentsFilesNames.TERMS_OF_USE]: {
    filename: "Terms_of_use.pdf",
    path: "Terms_of_Use_pabolo.pdf",
  },
};

export enum EmailTemplates {
  WELCOME_EMAIL = "templates/welcomeEmail.ejs",
  VERIFICATION_EMAIL = "templates/verificationEmail.ejs",
  ACCEPTED_VIDEO_EMAIL = "templates/acceptedVideoEmail.ejs",
  REJECTED_VIDEO_EMAIL = "templates/rejectedVideoEmail.ejs",
  NETZDG_EMAIL = "templates/netzdgEmail.ejs",
}

const encodeBase = "base64";

const encodeAttachment = (attachment: Attachment): string => {
  const attachmentPath = path.resolve(`/workspace/docs/${attachment.path}`);
  if (!fs.existsSync(attachmentPath)) {
    throw new Error(`Attachment file ${attachmentPath} does not exist`);
  }
  return fs.readFileSync(attachmentPath, { encoding: encodeBase });
};

const prepareAttachments = async (
  attachments: Attachment[]
): Promise<Array<{ filename: string; content: string; encoding: string }>> => {
  return await Promise.all(
    attachments.map(attachment => {
      return {
        filename: attachment.filename,
        content: encodeAttachment(attachment),
        encoding: encodeBase,
      };
    })
  );
};

/**
 * Send an email.
 * @argument {object} params - The parameters for the email.
 * @property {string} EmailTemplates - The template that we want to use to send the email.
 * @property {string} receiverUid - UID for receiver.
 * @property {string} subject - The subject of the email.
 * @property {object} variables - The variables that we want to replace in the email body.
 * @property {Array<AttachmentsFiles>} attachments - An array containing the list of attachments from AttachmentsFiles.
 * @returns {boolean} - True if the email is sent successfully.
 * @throws {Error} - If the email fails to send.
 */
export const sendEmail = async ({
  template,
  receiverUid,
  subject,
  variables,
  attachments = null,
}: {
  template: EmailTemplates;
  receiverUid: string;
  subject: string;
  variables: object;
  attachments?: Array<Attachment> | null;
}) => {
  try {
    const { email, display_name } = await getUserData(receiverUid);

    await sendEmailToEmailAddress({
      subject: `Hello ${display_name}, ${subject}`,
      template,
      emailAdress: email,
      variables,
      attachments,
      uid: receiverUid,
    });

    logger.log(`Email sent successfully to ${receiverUid}`);

    return true;
  } catch (error) {
    logger.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send an email providing an email address.
 *
 * @argument {object} params - The parameters for the email.
 * @property {string} EmailTemplates - The template that we want to use to send the email.
 * @property {string} emailAdress - Email address of the receiver.
 * @property {string} subject - The subject of the email.
 * @property {object} variables - The variables that we want to replace in the email body.
 * @property {Array<AttachmentsFiles>} attachments - An array containing the list of attachments from AttachmentsFiles.
 * @returns {boolean} - True if the email is sent successfully.
 * @throws {Error} - If the email fails to send.
 */
export const sendEmailToEmailAddress = async ({
  template,
  emailAdress,
  subject,
  variables,
  attachments = null,
  uid,
}: {
  template: EmailTemplates;
  emailAdress?: string;
  subject: string;
  variables: object;
  attachments?: Array<Attachment> | null;
  uid?: string;
}) => {
  // Send the email using Firebase Email
  const html = await ejs.renderFile(getFilePath(template), variables);
  try {
    await addMail({
      to: [emailAdress],
      message: {
        subject,
        html,
        attachments: attachments ? await prepareAttachments(attachments) : null,
      },
      ...(uid && { uid }),
    });
    logger.log(`Email sent successfully to ${emailAdress}`);
  } catch (error) {
    logger.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};
