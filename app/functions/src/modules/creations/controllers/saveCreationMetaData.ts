import { setCreationData } from "../../../DB/creationRepository";
import * as collectionGetters from "../../../DB/collectionGetters";
import { getTimestamp } from "../../../utils/time";

export const saveCreationMetaData = async ({
  newCreation,
  uid,
  genre,
  audience,
  attributes,
  creationId,
}: {
  newCreation: boolean;
  uid: string;
  genre: number;
  audience: number;
  attributes: string[];
  creationId: string;
}): Promise<string> => {
  const creationsRef = collectionGetters.getCreationListDoc(uid);
  const timestamp = getTimestamp();
  const dataToSave = {
    genre,
    audience,
    attributes,
    title: "",
    maxStep: 1,
    completed: false,
    updated_at: timestamp,
  };

  if (newCreation) {
    const { id } = await creationsRef.add({ ...dataToSave, created_at: timestamp });
    return id;
  }

  await setCreationData(uid, creationId, dataToSave);

  return creationId;
};
