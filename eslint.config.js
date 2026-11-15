import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/app/**",
                "@/features/**",
                "@/store/**",
                "@/domain/**",
                "@/mocks/**",
              ],
              message:
                "Shared UI and formatters must not depend on application or feature state.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/{domain,mocks,config,store}/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react/**",
                "react-router",
                "@/app/**",
                "@/features/**",
                "@/shared/**",
              ],
              message:
                "Data contracts, fixtures and transitions must stay independent of React and feature UI.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              regex: "^@/app/(?!(?:providers/AppContext|pages/Missing)$)",
              message:
                "Features may use the injected app context and record recovery, but not app layouts or routing internals.",
            },
            {
              group: ["@/features/*/hooks/**", "@/features/*/model/**"],
              message:
                "Keep feature hooks and models private; use a relative import inside the owning feature.",
            },
          ],
        },
      ],
    },
  },
]);
