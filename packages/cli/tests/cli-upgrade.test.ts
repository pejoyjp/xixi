import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as repoService from "../src/services/repo-service";
import { runUpgrade } from "../src/commands/upgrade";

const dirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.HOME;
  delete process.env.USERPROFILE;
  await Promise.all(dirs.map((dir) => fs.remove(dir)));
  dirs.length = 0;
});

describe("upgrade command", () => {
  it("upgrades one installed skill and updates index", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-upgrade-home-"));
    const stagedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-upgrade-stage-"));
    dirs.push(home, stagedRoot);
    process.env.HOME = home;
    process.env.USERPROFILE = home;

    const installRoot = path.join(home, ".codex", "skills");
    const skillPath = path.join(installRoot, "pr-description");
    await fs.outputFile(path.join(skillPath, "SKILL.md"), "---\nname: pr-description\ndescription: old\n---\n");
    await fs.outputFile(path.join(skillPath, "agents", "openai.yaml"), "interface:\n  display_name: old\n  short_description: old\n  default_prompt: old\n");

    await fs.outputJson(path.join(home, ".xixi", "index.json"), {
      "pr-description": {
        name: "pr-description",
        description: "old",
        installedPath: skillPath,
        source: { repo: "git@github.com:org/repo.git", ref: "oldref" }
      }
    });

    await fs.outputFile(
      path.join(stagedRoot, "SKILL.md"),
      "---\nname: pr-description\ndescription: new-desc\n---\n\n# PR Description\n"
    );
    await fs.outputFile(
      path.join(stagedRoot, "agents", "openai.yaml"),
      "interface:\n  display_name: PR Description\n  short_description: new-desc\n  default_prompt: Do the task\n"
    );

    vi.spyOn(repoService, "installFromRepo").mockResolvedValue({
      stagedSkillPath: stagedRoot,
      commitHash: "newref123",
      repoUrl: "git@github.com:org/xixi-skills.git",
      cleanup: async () => {}
    });

    await runUpgrade(
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

    const index = await fs.readJson(path.join(home, ".xixi", "index.json"));
    expect(index["pr-description"]).toEqual(
      expect.objectContaining({
        description: "new-desc",
        source: expect.objectContaining({ ref: "newref123" })
      })
    );
  });
});
