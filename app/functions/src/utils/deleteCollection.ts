import admin from "firebase-admin";

// Delete all documents in a collection in a batch
export const deleteCollection = (collection: admin.firestore.CollectionReference) => {
  const batch = admin.firestore().batch();
  return collection.get().then(snapshot => {
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });
    return batch.commit().then(() => {
      return true;
    });
  });
};
