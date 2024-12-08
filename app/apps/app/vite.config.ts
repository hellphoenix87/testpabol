/// <reference types="vitest" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import fs from "fs";
import { backendUrl, commitHash } from "../../globalConfig.js";

// Add runtime parameters to the process.env object.
// We distinguish between mock and everything else, to have faster tests.
// Returns a dict of two strings.
// process.env.npm_config_scenes and process.env.npm_config_shots are set
// when the command npm run dev:app is running with params. Parametres of the script are in the main readme.md file.
function movieParameters(mode: string): { MOVIE_SCENES: string; MOVIE_SHOTS: string } {
  // For mock, use 3 scenes and 3 shots.
  if (mode === "test" || mode === "development") {
    return {
      MOVIE_SCENES: process.env.npm_config_scenes ?? "3",
      MOVIE_SHOTS: process.env.npm_config_shots ?? "3",
    };
  }
  return {
    MOVIE_SCENES: "5",
    MOVIE_SHOTS: "8",
  };
}

const testConfig = {
  globals: true,
  environment: "jsdom",
  setupFiles: "./tests/setup.ts",
  deps: {
    inline: ["vitest-canvas-mock"],
  },
  exclude: [
    "**/node_modules/**",
    "**/dist/**",
    "**/cypress/**",
    "**/.{idea,git,cache,output,temp}/**",
    "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    "**/tests/e2e/**",
  ],
};

// https://vitejs.dev/config/
export default configEnv => {
  // Load app-level env vars to node-level env vars.
  const newEnv = {
    __COMMIT_HASH__: commitHash,
    BACKEND_URL: backendUrl(),
    CONFIG_MODE: configEnv.mode,
    ...loadEnv(configEnv.mode, `${process.cwd()}/../../`, ["PABOLO_", "GOOGLE_"]),
  };

  process.env = { ...process.env, ...newEnv };

  console.log("Environment Variables:", newEnv);

  fs.writeFileSync("vite.config.log", JSON.stringify(process.env, null, " "));
  return defineConfig({
    plugins: [react()],
    define: {
      "process.env": process.env,
    },
    publicDir: "../../public",
    test: testConfig,
    resolve: {
      alias: {
        "@shared": fileURLToPath(new URL("../../shared", import.meta.url)),
        "@frontend": fileURLToPath(new URL("../frontend", import.meta.url)),
        "@app": fileURLToPath(new URL("./src", import.meta.url)),
        "./generateVideoFile": "rollup-plugin-node-builtins",
        "./ffmpeg": "rollup-plugin-node-builtins",
        "./nodeStorage": "rollup-plugin-node-builtins",
        path: "rollup-plugin-node-polyfills/polyfills/path",
        os: "rollup-plugin-node-polyfills/polyfills/os",
      },
    },

    build: {
      manifest: true,
      rollupOptions: {
        external: [
          "src/**/*.spec.ts",
          "src/**/*.spec.tsx",
          "src/**/*.test.ts",
          "src/**/*.test.tsx",
          "src/stories/",
          "tests/",
        ],
      },
    },
  });
};
