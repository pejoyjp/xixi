import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const createdHomes: string[] = [];

function makeHomeDir(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xixi-config-home-"));
  createdHomes.push(dir);
  return dir;
}

afterEach(async () => {
  delete process.env.HOME;
  delete process.env.USERPROFILE;
  await Promise.all(createdHomes.map((item) => fs.remove(item)));
  createdHomes.length = 0;
});

describe("config", () => {
  it("creates default config on first load", async () => {
    const home = makeHomeDir();
    process.env.HOME = home;
    process.env.USERPROFILE = home;
    const { loadOrCreateConfig } = await import("../src/config");
    const result = await loadOrCreateConfig();
    expect(result.created).toBe(true);
    expect(result.config.skillsRepo.url).toContain("xixi-skills");
    expect(result.config.installRoot).toBe(path.join(home, ".codex", "skills"));
  });

  it("loads existing config", async () => {
    const home = makeHomeDir();
    process.env.HOME = home;
    process.env.USERPROFILE = home;
    const configPath = path.join(home, ".xixi", "config.json");
    await fs.outputJson(configPath, {
      skillsRepo: { url: "git@github.com:org/repo.git" },
      depts: ["engineering", "ops"]
    });
    const { loadOrCreateConfig } = await import("../src/config");
    const result = await loadOrCreateConfig();
    expect(result.created).toBe(false);
    expect(result.config.depts).toEqual(["engineering", "ops"]);
    expect(result.config.installRoot).toBe(path.join(home, ".codex", "skills"));
  });
});
