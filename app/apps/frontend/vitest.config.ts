import { defineConfig } from "vite";

export default () => {
  return defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: "./tests/setup.ts",
      coverage: {
        provider: "v8",
        all: true,
        reportsDirectory: "./tests/unit/coverage",
        reporter: ["text", "json", "html"],
      },
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/cypress/**",
        "**/.{idea,git,cache,output,temp}/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/tests/e2e/**",
        "**/apps/app/**",
        "**/apps/backoffice/**",
      ],
    },
  });
};
