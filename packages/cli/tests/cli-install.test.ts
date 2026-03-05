import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as repoService from "../src/services/repo-service";
import { runInstall } from "../src/commands/install";

const dirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  delete process.env.HOME;
  delete process.env.USERPROFILE;
  await Promise.all(dirs.map((dir) => fs.remove(dir)));
  dirs.length = 0;
});

describe("install command", () => {
  it("writes index record", async () => {
    const stagedRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-install-stage-"));
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-install-home-"));
    dirs.push(stagedRoot, home);
    process.env.HOME = home;
    process.env.USERPROFILE = home;
    await fs.outputFile(
      path.join(stagedRoot, "xixi.yaml"),
      "schema_version: 1\nname: pr-description\ndept: engineering\ndescription: desc\nentry: prompt.md\n"
    );
    await fs.outputFile(path.join(stagedRoot, "prompt.md"), "hello");

    vi.spyOn(repoService, "installFromRepo").mockResolvedValue({
      stagedSkillPath: stagedRoot,
      commitHash: "abc123",
      repoUrl: "git@github.com:org/xixi-skills.git",
      cleanup: async () => {}
    });

    await runInstall(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
          installRoot: path.join(home, "installed"),
          depts: ["engineering"]
        }
      },
      "engineering/pr-description",
      {}
    );

    const index = await fs.readJson(path.join(home, ".xixi", "index.json"));
    expect(index["engineering/pr-description"]).toEqual(
      expect.objectContaining({
        dept: "engineering",
        name: "pr-description"
      })
    );
  });
});
