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
      "SKILL.md": "---\nname: pr-description\ndescription: desc\n---\n\n# Prompt\n",
      "agents/openai.yaml":
        "interface:\n  display_name: PR Description\n  short_description: desc\n  default_prompt: Do the task\n"
    });
    const manifest = await loadAndValidateManifest(dir);
    expect(manifest.name).toBe("pr-description");
  });

  it("rejects non-kebab name", async () => {
    const dir = await makeTempSkill({
      "SKILL.md": "---\nname: BadName\ndescription: desc\n---\n\n# Prompt\n",
      "agents/openai.yaml":
        "interface:\n  display_name: PR Description\n  short_description: desc\n  default_prompt: Do the task\n"
    });
    await expect(loadAndValidateManifest(dir)).rejects.toThrow();
  });

  it("rejects missing openai metadata", async () => {
    const dir = await makeTempSkill({
      "SKILL.md": "---\nname: pr-description\ndescription: desc\n---\n\n# Prompt\n"
    });
    await expect(loadAndValidateManifest(dir)).rejects.toThrow();
  });

  it("rejects invalid frontmatter", async () => {
    const dir = await makeTempSkill({
      "SKILL.md": "# Missing frontmatter",
      "agents/openai.yaml":
        "interface:\n  display_name: PR Description\n  short_description: desc\n  default_prompt: Do the task\n"
    });
    await expect(loadAndValidateManifest(dir)).rejects.toThrow();
  });
});
