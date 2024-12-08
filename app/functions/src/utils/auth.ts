export const getUidFromContext = (context: { auth?: { uid?: string | null } }) => {
  if (!context.auth) {
    throw new Error("Unauthenticated");
  }
  if (!context.auth.uid) {
    throw new Error("Invalid UID");
  }
  return context.auth.uid;
};
