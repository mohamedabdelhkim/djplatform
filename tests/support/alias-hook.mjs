// Resolves the "@/..." path alias (defined in tsconfig.json) for the Node test
// runner, which does not read tsconfig. Node strips the TypeScript itself, so
// the suite needs no build step, no transpiler and no dependencies.
import { registerHooks } from "node:module";
import { pathToFileURL } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CANDIDATES = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = path.join(ROOT, "src", specifier.slice(2));
      for (const ext of CANDIDATES) {
        const candidate = base + ext;
        if (existsSync(candidate)) {
          return { url: pathToFileURL(candidate).href, shortCircuit: true };
        }
      }
      throw new Error(`Cannot resolve alias "${specifier}" under ${ROOT}/src`);
    }
    return nextResolve(specifier, context);
  },
});
