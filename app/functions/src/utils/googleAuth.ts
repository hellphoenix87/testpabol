import { OAuth2Client, GoogleAuth } from "google-auth-library";
import admin from "firebase-admin";

const authClient = new OAuth2Client();
const googleAuth = new GoogleAuth();

export const getToken = (tokenHeader?: string) => {
  return tokenHeader?.replace(/^bearer /i, "");
};

export const validateGCPToken = async (props: { token?: string; allowedServiceAccounts?: string[] }) => {
  const token = getToken(props.token);
  if (!token) {
    return false;
  }
  try {
    const ticket = await authClient.verifyIdToken({ idToken: token });
    const email = ticket?.getPayload()?.email || "";
    return isModerator(email) || isAllowedServiceAccount(email, props.allowedServiceAccounts ?? []);
  } catch {
    return false;
  }
};

export const getUserFromToken = async (tokenHeader?: string): Promise<{ email?: string; uid: string } | null> => {
  const token = getToken(tokenHeader);
  if (!token) {
    return null;
  }
  try {
    const verifiedToken = await admin.auth().verifyIdToken(token);
    return verifiedToken ? { email: verifiedToken.email, uid: verifiedToken.user_id } : null;
  } catch {
    return null;
  }
};

export const isModerator = (email: string) => {
  return /@(pabolo|paramax)\.ai/i.test(email);
};

export const isAllowedServiceAccount = (email: string, allowedServiceAccounts: string[]) => {
  return allowedServiceAccounts.includes(email);
};

export const generateToken = async (audience: string) => {
  const client = await googleAuth.getIdTokenClient(audience);
  return await client.idTokenProvider.fetchIdToken(audience);
};
