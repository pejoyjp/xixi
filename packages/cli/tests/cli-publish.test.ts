import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as repoService from "../src/services/repo-service";
import { runPublish } from "../src/commands/publish";

const dirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(dirs.map((dir) => fs.remove(dir)));
  dirs.length = 0;
});

describe("publish command", () => {
  it("fails on dept mismatch", async () => {
    const skillRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-publish-"));
    dirs.push(skillRoot);
    await fs.outputFile(
      path.join(skillRoot, "xixi.yaml"),
      "schema_version: 1\nname: pr-description\ndept: engineering\ndescription: desc\nentry: prompt.md\n"
    );
    await fs.outputFile(path.join(skillRoot, "prompt.md"), "prompt");
    await expect(
      runPublish(
        {
          verbose: false,
          config: {
            skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
            depts: ["engineering", "ops"]
          }
        },
        { path: skillRoot, dept: "ops" }
      )
    ).rejects.toThrow();
  });

  it("publishes with force", async () => {
    const skillRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-publish-"));
    dirs.push(skillRoot);
    await fs.outputFile(
      path.join(skillRoot, "xixi.yaml"),
      "schema_version: 1\nname: pr-description\ndept: engineering\ndescription: desc\nentry: prompt.md\n"
    );
    await fs.outputFile(path.join(skillRoot, "prompt.md"), "prompt");
    const publishSpy = vi.spyOn(repoService, "publishToRepo").mockResolvedValue({
      targetPath: "engineering/pr-description",
      commitHash: "abc",
      branch: "main"
    });
    await runPublish(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
          depts: ["engineering"]
        }
      },
      { path: skillRoot, dept: "engineering", force: true }
    );
    expect(publishSpy).toHaveBeenCalled();
  });
});

