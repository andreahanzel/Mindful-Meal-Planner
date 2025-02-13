import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import importsPlugin from "eslint-plugin-import";
// eslint.config.js
export default [
  eslint.configs.recommended,
  // Browser files configuration
  {
    files: ["src/**/*.js", "src/**/*.mjs", "dist/**/*.js"],
    plugins: {
      import: importsPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Browser globals
        window: true,
        document: true,
        console: true,
        fetch: true,
        alert: true,
        localStorage: true,
        sessionStorage: true,
        URLSearchParams: true,
        MutationObserver: true,
        CustomEvent: true,
        Notification: true,  // Add Notification HERE
        prompt: true,        // Add prompt HERE
        setInterval: true,   // Add setInterval HERE
        clearInterval: true, // Add clearInterval HERE
        Event: true // Add Event HERE

      },
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "res|next|^err" }],
      "arrow-body-style": ["error", "as-needed"],
      "no-param-reassign": ["error", { props: false }],
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
      quotes: ["error", "double", { allowTemplateLiterals: true }],
      "func-names": "off",
      "space-unary-ops": "error",
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "comma-dangle": "off",
      "max-len": "off",
      "import/extensions": "off",
      "import/namespace": "off",
      "no-underscore-dangle": "off",
      "consistent-return": "off",
      radix: "off",
      "no-shadow": [
        "error",
        {
          hoist: "all",
          allow: ["resolve", "reject", "done", "next", "err", "error"],
        },
      ],
      "no-unused-expressions": "off",
    },
  },
  // Node.js files configuration
  {
    files: ["*.js", "vite.config.js"],
    plugins: {
      import: importsPlugin,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        // Node.js globals
        __dirname: true,
        __filename: true,
        process: true,
        module: true,
        require: true,
        exports: true,
      },
    },
    rules: {
      "no-console": "off",
      "import/extensions": "off",
      "import/namespace": "off",
    },
  },
  eslintConfigPrettier,
];
