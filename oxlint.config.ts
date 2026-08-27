import { defineConfig } from "oxlint";

export default defineConfig({
  options: {
    maxWarnings: 10,
  },
  plugins: ["typescript", "unicorn", "oxc", "node"],
  ignorePatterns: ["**/node_modules/**", "**/dist/**", "**/build/**"],
});
