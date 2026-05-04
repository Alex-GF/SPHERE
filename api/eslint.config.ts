import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    rules: {
      semi: ["error", "always"],
      
      // Deactivated default TS linting rules
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-this-alias": "off",

      // Additional rules
      "no-duplicate-imports": ["error"],
      "no-fallthrough": ["error"],
      "no-irregular-whitespace": ["error"],
    },
  },
];
