import tseslint from "typescript-eslint";
import nextConfig from "eslint-config-next/core-web-vitals";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "coverage/**",
      "scripts/**",
      "tests/**",
      "supabase-docker/**",
    ],
  },
  ...nextConfig,
  {
    // React Compiler rules (eslint-plugin-react-hooks v7) — disabled for React 18 codebase.
    // These will be revisited during UP-S03 (React 19 migration) if React Compiler is enabled.
    rules: {
      "react-hooks/static-components": "off",
      "react-hooks/incompatible-library": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: "./tsconfig.json" },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      // Disable base rule to avoid conflicting diagnostics with the TS-aware version
      "no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default config;
