import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // `next lint` solo revisaba src/; scripts/ son utilidades de migración one-off
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "scripts/**"]),
  {
    // Reglas nuevas del React Compiler (eslint-plugin-react-hooks 7).
    // Quedan como warning hasta refactorizar los componentes afectados.
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/use-memo": "warn",
    },
  },
]);

export default eslintConfig;
