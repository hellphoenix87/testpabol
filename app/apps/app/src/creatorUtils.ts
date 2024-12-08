import { NAVIGATION } from "@app/components/Navigation";

const AVAILABLE_ELEMENTS_COUNT = 1;

// Should a step be locked? (i.e. should the lock icon be shown?)
export function showLockSymbol(itemId: number, maxStep: number) {
  if (maxStep <= itemId) {
    return false;
  }
  // If the user has not reached this step yet, don't show the lock
  if (itemId >= NAVIGATION.length - AVAILABLE_ELEMENTS_COUNT) {
    return false;
  }
  // last 2 steps are always unlocked
  return true;
}
