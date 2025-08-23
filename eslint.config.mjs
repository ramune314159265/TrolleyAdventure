import js from "@eslint/js"
import { defineConfig } from "eslint/config"
import globals from "globals"


export default defineConfig([
  { ignores: ["dist/**/*.{js,mjs,cjs}"] },
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  {
    files: ["client/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.browser },
    rules: {
      "semi": [
        "error",
        "never",
        {
          "beforeStatementContinuationChars": "never"
        }
      ],
      "semi-spacing": [
        "error",
        {
          "after": true,
          "before": false
        }
      ],
      "semi-style": [
        "error",
        "first"
      ],
      "no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error"
    },
  },
  {
    files: ["server/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
    rules: {
      "semi": [
        "error",
        "never",
        {
          "beforeStatementContinuationChars": "never"
        }
      ],
      "semi-spacing": [
        "error",
        {
          "after": true,
          "before": false
        }
      ],
      "semi-style": [
        "error",
        "first"
      ],
      "no-extra-semi": "error",
      "no-unexpected-multiline": "error",
      "no-unreachable": "error"
    },
  }
])
