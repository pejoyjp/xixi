import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  noExternal: [/.*/],
  sourcemap: true,
  clean: true,
  dts: false,
  target: "node18",
  outDir: "../../dist",
  banner: {
    js: "#!/usr/bin/env node"
  }
});
