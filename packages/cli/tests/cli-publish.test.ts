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
  it("publishes with force", async () => {
    const skillRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-publish-"));
    dirs.push(skillRoot);
    await fs.outputFile(
      path.join(skillRoot, "SKILL.md"),
      "---\nname: pr-description\ndescription: desc\n---\n\n# PR Description\n"
    );
    await fs.outputFile(
      path.join(skillRoot, "agents", "openai.yaml"),
      "interface:\n  display_name: PR Description\n  short_description: desc\n  default_prompt: Do the task\n"
    );
    const publishSpy = vi.spyOn(repoService, "publishToRepo").mockResolvedValue({
      targetPath: "skills/pr-description",
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
      { path: skillRoot, force: true }
    );
    expect(publishSpy).toHaveBeenCalled();
  });

  it("publishes installed skill by name", async () => {
    const installRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-installed-"));
    const skillRoot = path.join(installRoot, "pr-description");
    dirs.push(installRoot);
    await fs.outputFile(
      path.join(skillRoot, "SKILL.md"),
      "---\nname: pr-description\ndescription: desc\n---\n\n# PR Description\n"
    );
    await fs.outputFile(
      path.join(skillRoot, "agents", "openai.yaml"),
      "interface:\n  display_name: PR Description\n  short_description: desc\n  default_prompt: Do the task\n"
    );
    const publishSpy = vi.spyOn(repoService, "publishToRepo").mockResolvedValue({
      targetPath: "skills/pr-description",
      commitHash: "abc",
      branch: "main"
    });

    await runPublish(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
          installRoot
        }
      },
      { name: "pr-description", force: true }
    );

    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        skillRoot
      })
    );
  });

  it("auto-selects installed skill when cwd is not a skill root", async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-cwd-"));
    const installRoot = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-installed-"));
    dirs.push(cwd, installRoot);
    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    await fs.outputFile(
      path.join(installRoot, "beta-skill", "SKILL.md"),
      "---\nname: beta-skill\ndescription: desc\n---\n\n# Beta\n"
    );
    await fs.outputFile(
      path.join(installRoot, "beta-skill", "agents", "openai.yaml"),
      "interface:\n  display_name: Beta\n  short_description: desc\n  default_prompt: Do the task\n"
    );
    const publishSpy = vi.spyOn(repoService, "publishToRepo").mockResolvedValue({
      targetPath: "skills/beta-skill",
      commitHash: "abc",
      branch: "main"
    });

    await runPublish(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" },
          installRoot
        }
      },
      { force: true }
    );

    expect(publishSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        skillRoot: path.join(installRoot, "beta-skill")
      })
    );
  });
});
