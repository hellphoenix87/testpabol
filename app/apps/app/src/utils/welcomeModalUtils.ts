import { auth } from "@app/firebase/firebaseConfig";

// Nouns and adjectives for random username generation
export const adjectives = [
  "Cinephile",
  "Movie",
  "Film",
  "Celluloid",
  "Screen",
  "Reel",
  "Cine",
  "Picture",
  "Flick",
  "Popcorn",
  "Couch",
  "Laughing",
  "Theatrical",
  "Film Geek",
  "Quirky",
  "Cinematic",
  "Comedy",
  "Hilarious",
];

export const nouns = [
  "Flicks",
  "Maniac",
  "Frenzy",
  "Champ",
  "Sorcerer",
  "Addict",
  "Ninja",
  "Pirate",
  "Hero",
  "Pundit",
  "Buffoon",
  "Critiquer",
  "Cinematographer",
  "Maverick",
  "Joker",
  "Wizard",
  "Cineaste",
  "Chuckle",
  "Lover",
  "Hollywood",
];

// Generates a random username when a user signs up
export function generateRandomName(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return adjective + noun + Math.random().toString().slice(2, 4);
}

// Gets the display name of the current user if it exists, else generates a random name
export function getDisplayName(): string {
  const currentUser = auth?.currentUser;

  // If the user has a display name (from google), return it
  if (currentUser?.displayName) {
    return currentUser.displayName;
  }
  // Else generate a random name
  return generateRandomName();
}
