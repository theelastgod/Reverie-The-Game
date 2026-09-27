import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "server/**/*.test.ts"],
    // The bench crosses the sim's module boundaries on every step, which vitest 5's module runner turns into
    // getters; the warning it would print on every run says so, and the bench's header says what it means
    // for the numbers (compare them within one vitest major), so the warning has nothing left to add.
    benchmark: { suppressExportGetterWarnings: true },
  },
});
