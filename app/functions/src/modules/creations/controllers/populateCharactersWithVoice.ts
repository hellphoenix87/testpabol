import { Character } from "../../../schema/Character.schema";

export const populateCharactersWithVoice = (characters: Character[]): Character[] => {
  return characters.map(character => {
    return { ...character, voice: character.voices[character.selected_voice_index ?? 0] };
  });
};
