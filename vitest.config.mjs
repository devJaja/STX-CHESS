import { defineConfig } from "vite";
import { vitestSetupFilePath, getClarinetVitestsArgv } from "@hirosystems/clarinet-sdk/vitest";

export default defineConfig({
  test: {
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
    setupFiles: [vitestSetupFilePath],
    environmentOptions: {
      clarinet: {
        ...getClarinetVitestsArgv(),
        // Run all tests in a single simnet instance for speed
        initBeforeEach: false,
      },
    },
    // Increase timeout for simnet initialization
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
