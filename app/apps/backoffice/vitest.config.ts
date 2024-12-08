import { defineConfig } from "vitest/config";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@shared": fileURLToPath(new URL("../../shared", import.meta.url)),
      "@frontend": fileURLToPath(new URL("../frontend", import.meta.url)),
      "@backoffice": fileURLToPath(new URL("./src", import.meta.url)),
      "./generateVideoFile": "rollup-plugin-node-builtins",
      "./nodeStorage": "rollup-plugin-node-builtins",
      path: "rollup-plugin-node-polyfills/polyfills/path",
      os: "rollup-plugin-node-polyfills/polyfills/os",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/tests/e2e/**",
    ],
  },
});
