import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  sourcemap: true,
  clean: true,
  dts: true,
  target: "node18",
  outDir: "dist",
  banner: {
    js: "#!/usr/bin/env node"
  }
});

