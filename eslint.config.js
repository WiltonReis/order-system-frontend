import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", ".output", ".vinxi"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  eslintPluginPrettier,
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            { group: ["@/hooks/queries/*"], message: "Old hooks path. Use @/features/<domain>/hooks/ instead." },
            { group: ["@/schemas/*"], message: "Old schemas path. Use @/features/<domain>/schemas/ instead." },
            { group: ["@/services/*"], message: "Old services path. Use @/features/<domain>/api/ instead." },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/orders/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        { patterns: [{ group: ["@/features/products/*"], message: "Cross-feature import: orders → products. Route through shared/ or pass as prop." }] },
      ],
    },
  },
  {
    files: ["src/features/products/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "warn",
        { patterns: [{ group: ["@/features/orders/*"], message: "Cross-feature import: products → orders. Route through shared/ or pass as prop." }] },
      ],
    },
  },
);
