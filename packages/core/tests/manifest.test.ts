import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { loadAndValidateManifest } from "../src/manifest";

const tempDirs: string[] = [];

async function makeTempSkill(files: Record<string, string>): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-manifest-test-"));
  tempDirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    await fs.outputFile(path.join(dir, name), content);
  }
  return dir;
}

afterEach(async () => {
  await Promise.all(tempDirs.map((item) => fs.remove(item)));
  tempDirs.length = 0;
});

describe("manifest validation", () => {
  it("accepts valid manifest", async () => {
    const dir = await makeTempSkill({
      "xixi.yaml": "schema_version: 1\nname: pr-description\ndept: engineering\ndescription: desc\nentry: prompt.md\n",
      "prompt.md": "# prompt"
    });
    const manifest = await loadAndValidateManifest(dir, ["engineering"]);
    expect(manifest.name).toBe("pr-description");
  });

  it("rejects non-kebab name", async () => {
    const dir = await makeTempSkill({
      "xixi.yaml": "schema_version: 1\nname: BadName\ndept: engineering\ndescription: desc\nentry: prompt.md\n",
      "prompt.md": "# prompt"
    });
    await expect(loadAndValidateManifest(dir, ["engineering"])).rejects.toThrow();
  });

  it("rejects unknown dept", async () => {
    const dir = await makeTempSkill({
      "xixi.yaml": "schema_version: 1\nname: pr-description\ndept: finance\ndescription: desc\nentry: prompt.md\n",
      "prompt.md": "# prompt"
    });
    await expect(loadAndValidateManifest(dir, ["engineering"])).rejects.toThrow();
  });

  it("rejects missing entry", async () => {
    const dir = await makeTempSkill({
      "xixi.yaml": "schema_version: 1\nname: pr-description\ndept: engineering\ndescription: desc\nentry: prompt.md\n"
    });
    await expect(loadAndValidateManifest(dir, ["engineering"])).rejects.toThrow();
  });
});

