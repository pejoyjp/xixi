import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runUninstall } from "../src/commands/uninstall";

const dirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.HOME;
  delete process.env.USERPROFILE;
  await Promise.all(dirs.map((dir) => fs.remove(dir)));
  dirs.length = 0;
});

describe("uninstall command", () => {
  it("removes installed path and index record", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-uninstall-home-"));
    dirs.push(home);
    process.env.HOME = home;
    process.env.USERPROFILE = home;

    const installRoot = path.join(home, ".codex", "skills");
    const skillPath = path.join(installRoot, "pr-description");
    await fs.outputFile(path.join(skillPath, "SKILL.md"), "---\nname: pr-description\ndescription: desc\n---\n");

    await fs.outputJson(path.join(home, ".xixi", "index.json"), {
      "pr-description": {
        name: "pr-description",
        description: "desc",
        installedPath: skillPath,
        source: { repo: "git@github.com:org/repo.git", ref: "abc" }
      }
    });

    await runUninstall(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
          installRoot
        }
      },
      "pr-description",
      { force: true }
    );

    expect(await fs.pathExists(skillPath)).toBe(false);
    const index = await fs.readJson(path.join(home, ".xixi", "index.json"));
    expect(index["pr-description"]).toBeUndefined();
  });
});
