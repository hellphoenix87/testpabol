import {
  signOut,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  beforeAuthStateChanged,
  User,
  UserInfo,
  deleteUser,
  linkWithPopup,
} from "firebase/auth";
import { auth } from "./firebaseConfig";

enum PROVIDERS_IDS {
  PASSWORD_PROVIDER_ID = "password",
  MICROSOFT_PROVIDER_ID = "microsoft.com",
}

// Public tenant ID of the Microsoft 365 company subscription.
const tenantId = "e932bb0a-819a-4b31-a6f9-fafbd5fdae03";

export const microsoftAuthProvider = new OAuthProvider(PROVIDERS_IDS.MICROSOFT_PROVIDER_ID);
microsoftAuthProvider.setCustomParameters({
  tenant: tenantId,
});
microsoftAuthProvider.addScope("mail.read");
microsoftAuthProvider.addScope("user.read");

beforeAuthStateChanged(auth, async (user: User | null) => {
  console.log(user);
  if (!user) {
    return;
  }

  if (user && !(user.email?.endsWith("@paramax.ai") || user.email?.endsWith("@pabolo.ai"))) {
    alert("You are not authorized to access this site.");
    return;
  }

  if (checkUserHasProvider(user, PROVIDERS_IDS.PASSWORD_PROVIDER_ID)) {
    await linkProvider(user, microsoftAuthProvider);
    return;
  }
  await deleteUser(user);
  alert(`Pabolo account is not found, please create a Pabolo account with ${user.email} email`);
  throw new Error("Pabolo account not found");
});

export function loginWithGoogle() {
  const googleAuthProvider = new GoogleAuthProvider();
  return signInWithPopup(auth, googleAuthProvider);
}

export async function loginWithMicrosoft() {
  return await signInWithPopup(auth, microsoftAuthProvider);
}

export async function signInWithEmailAndLinkProvider(email: string, password: string, oauthProvider: OAuthProvider) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);

    // Link the OAuth Credentials to original account
    await linkProvider(result.user, oauthProvider);
  } catch (error) {
    alert("The provided password may be invalid.");
  }
}

function checkUserHasProvider(user: User, providerId: PROVIDERS_IDS): boolean {
  const providersList: UserInfo[] = user.providerData;
  const passwordProvider = providersList.find((provider: UserInfo) => provider.providerId === providerId.toString());
  if (passwordProvider) {
    return true;
  }
  return false;
}

async function linkProvider(user: User, oauthProvider: OAuthProvider) {
  if (checkUserHasProvider(user, oauthProvider.providerId as PROVIDERS_IDS)) {
    return;
  }
  await linkWithPopup(user, oauthProvider);
}

export function logOut() {
  return signOut(auth);
}
