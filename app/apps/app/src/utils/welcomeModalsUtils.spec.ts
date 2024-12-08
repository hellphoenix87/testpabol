import { describe, test, vi } from "vitest";
import { auth } from "@app/firebase/firebaseConfig";
import { adjectives, generateRandomName, nouns, getDisplayName } from "./welcomeModalUtils";

vi.mock("@app/firebase/firebaseConfig", () => ({
  auth: {
    currentUser: {
      displayName: "John Doe",
    },
  },
}));

describe("generateRandomName", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("generate a random name with an adjective, a noun, and a random number", () => {
    // Generate a random name using the function
    const randomName = generateRandomName();

    // Check if the generated name contains an adjective from the array
    const hasAdjective = adjectives.some(adj => randomName.includes(adj));
    expect(hasAdjective).toBe(true);

    // Check if the generated name contains a noun from the array
    const hasNoun = nouns.some(noun => randomName.includes(noun));
    expect(hasNoun).toBe(true);

    // Check if the generated name ends with a two-digit random number
    const randomNum = randomName.slice(-2);
    const isTwoDigitNum = /^\d{2}$/.test(randomNum);
    expect(isTwoDigitNum).toBe(true);
  });
});

describe("getDisplayName", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("return the user display name if it exists", () => {
    const displayName = getDisplayName();
    expect(displayName).toBe("John Doe");
  });

  test("call generateRandomName if the user display name does not exist", () => {
    vi.mocked(auth as any).currentUser = null;

    // Call the function to be tested
    const displayName = getDisplayName();

    // Check if the generated name ends with a two-digit random number
    const randomNum = displayName.slice(-2);
    const isTwoDigitNum = /^\d{2}$/.test(randomNum);
    expect(isTwoDigitNum).toBe(true);
  });
});
