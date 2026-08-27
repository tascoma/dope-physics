import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // design/ is a vendored design-reference bundle (prototypes + a generated
  // runtime script), not project source — never lint it.
  { ignores: ["dist", "design"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
