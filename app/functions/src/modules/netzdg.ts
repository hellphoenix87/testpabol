import * as functions from "firebase-functions";
import { EmailTemplates, sendEmailToEmailAddress } from "../utils/email";
import NetzdgSchema from "../schema/Netzdg.schema";
import { validateSchema } from "../utils/validation";

// Send NetzDG submittion to support@pabolo.ai
export const sendNetzdgEmail = functions.https.onCall(async data => {
  const validatedNetzdg = validateSchema(data, NetzdgSchema);

  await sendEmailToEmailAddress({
    emailAdress: "support@pabolo.ai",
    subject: "A new NetzDG form is submitted.",
    template: EmailTemplates.NETZDG_EMAIL,
    variables: validatedNetzdg,
  });
});
