import Joi from "joi";
import CharacterSchema, { Character } from "./Character.schema";
import LocationSchema, { Location } from "./Location.schema";

export interface CharactersLocations {
  characters: Character[];
  locations: Location[];
}

const CharactersLocationsSchema = Joi.object<CharactersLocations>({
  characters: Joi.array().items(CharacterSchema),
  locations: Joi.array().items(LocationSchema),
});

export default CharactersLocationsSchema;
