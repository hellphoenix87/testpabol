import { expect, beforeEach, afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import matchers from "@testing-library/jest-dom/matchers";

import "vitest-canvas-mock";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// runs a setup before each test case (e.g. mocking window methods)
beforeEach(() => {
  window.HTMLMediaElement.prototype.play = vi.fn();
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
