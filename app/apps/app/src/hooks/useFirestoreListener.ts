import { useState, useEffect, useRef } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

/*
 This react hook is used to listen to changes in a firestore document
 It returns the up to date data of the document when it is updated
 It also returns a function to set the document id to listen to
 it is used to listen to multiple documents in the same collection
*/
const useFirestoreListener = <T = any>(collectionName: string) => {
  const [data, setData] = useState<{ [key: string]: T }>({});
  const [documentsIds, setDocumentsIds] = useState<string[]>([]);

  // This variable is used to keep track of the documents that have been fetched
  const initialDataFetchedIds = useRef<string[]>([]);

  const addToInitialDataFetchedIds = (documentId: string): void => {
    if (!initialDataFetchedIds.current.includes(documentId)) {
      initialDataFetchedIds.current = [...initialDataFetchedIds.current, documentId];
    }
  };

  const addDocumentIdToListen = (documentId: string): void => {
    if (!documentsIds.includes(documentId)) {
      setDocumentsIds(currentIds => [...currentIds, documentId]);
    }
  };

  useEffect(() => {
    // If there is no document id to listen to, do nothing
    if (!collectionName || !documentsIds || documentsIds.length === 0) {
      return;
    }

    const unsubscribeFunctions = documentsIds.map(documentId => {
      const unsubscribe = onSnapshot(doc(db, collectionName, documentId), doc => {
        if (initialDataFetchedIds.current.includes(documentId)) {
          const dataToSet = { ...data, [documentId]: doc.data() as T };
          setData(dataToSet);
        } else {
          addToInitialDataFetchedIds(documentId);
        }
      });

      return unsubscribe;
    });

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      initialDataFetchedIds.current = [];
    };
  }, [documentsIds]);

  return {
    upToDateData: data,
    setDocumentsIdsToListen: setDocumentsIds,
    addDocumentIdToListen,
  };
};

export default useFirestoreListener;
