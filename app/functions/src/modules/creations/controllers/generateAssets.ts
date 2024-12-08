import * as admin from "firebase-admin";

import { FALLBACK_CHARACTER_NAME } from "../../../../../shared";

import * as collectionGetters from "../../../DB/collectionGetters";
import CharactersLocationsSchema from "../../../schema/CharacterLocation.schema";
import { Character } from "../../../schema/Character.schema";
import { GeneratorRequsest } from "../../../integrations/creationGenerator";
import { validateSchemaWithErrorHandler } from "../../../utils/validation";
import { getCharactersAndLocationsFromGenerator } from "./getCharactersAndLocationsFromGenerator";
import { Scene } from "../../../schema/Scene.schema";
import { logger } from "firebase-functions/v1";

export const generateAssets = async ({
  uid,
  creationId,
  title,
  scenes,
  genre,
  audience,
  tags,
  isMock,
  req,
}: {
  uid: string;
  creationId: string;
  title: string;
  scenes: Scene[];
  genre: number;
  audience: number;
  tags: string[];
  isMock: boolean;
  req: GeneratorRequsest;
}) => {
  logger.log("generateAssets: call creationGenerator");
  // Get characters and locations from generator API
  const charactersAndLocations = await getCharactersAndLocationsFromGenerator({
    creationId,
    uid,
    title,
    scenes,
    genre,
    audience,
    attributes: tags,
    req,
    isMock,
  });
  const { characters, locations } = validateSchemaWithErrorHandler(charactersAndLocations, CharactersLocationsSchema);

  const batch = admin.firestore().batch();
  const charactersWithVoices = characters.map(character => ({
    ...character,
    selected_voice_index: 0,
  }));
  const locationsOrder = locations.map(location => location.id);
  const charactersOrder = charactersWithVoices.reduce((prev: string[], curr: Character) => {
    if (curr.name !== FALLBACK_CHARACTER_NAME) {
      prev.push(curr.id);
    }
    return prev;
  }, []);

  const charactersRef = collectionGetters.getCharacterListDoc(uid, creationId);
  const locationsRef = collectionGetters.getLocationListDoc(uid, creationId);

  charactersWithVoices.forEach(item => {
    batch.set(charactersRef.doc(`${item.id}`), item, { merge: true });
  });

  locations.forEach(item => {
    batch.set(locationsRef.doc(`${item.id}`), item, { merge: true });
  });

  logger.log("generateAssets: call update");
  batch.update(collectionGetters.getCreationDoc(uid, creationId), { locationsOrder, charactersOrder });

  await batch.commit();
  logger.log("generateAssets: call update done");
};
