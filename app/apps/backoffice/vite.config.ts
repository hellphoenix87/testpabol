import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";
import { defaultBackendUrl, commitHash } from "../../globalConfig.js";

export default configEnv => {
  // https://vitejs.dev/config/
  return defineConfig({
    plugins: [react()],
    publicDir: "../../public",
    envDir: "../../",
    server: {
      port: 3001,
    },
    define: {
      "process.env": {
        ...process.env,
        __COMMIT_HASH__: commitHash,
        BACKEND_URL: defaultBackendUrl,
        ...loadEnv(configEnv.mode, `${process.cwd()}/../../`, ["PABOLO_", "GOOGLE_"]),
      },
    },
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
    build: {
      manifest: true,
      rollupOptions: {
        external: [
          "src/**/*.spec.ts",
          "src/**/*.spec.tsx",
          "src/**/*.test.ts",
          "src/**/*.test.tsx",
          "src/stories/",
          "tests",
        ],
      },
    },
  });
};
