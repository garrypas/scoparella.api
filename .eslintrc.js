module.exports = {
  extends: "@loopback/eslint-config",
  rules: {
    "mocha/no-exclusive-tests": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/naming-convention": [
      "error",
      {selector: "variableLike", format: ["camelCase"]},
    ],
    "@typescript-eslint/no-invalid-this": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    semi: ["warn", "always"],
  },
};
