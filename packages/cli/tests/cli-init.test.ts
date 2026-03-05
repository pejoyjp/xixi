import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import inquirer from "inquirer";
import { runInit } from "../src/commands/init";

const dirs: string[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(dirs.map((dir) => fs.remove(dir)));
  dirs.length = 0;
});

describe("init command", () => {
  it("creates scaffold files", async () => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-cli-init-"));
    dirs.push(cwd);
    vi.spyOn(process, "cwd").mockReturnValue(cwd);
    vi.spyOn(inquirer, "prompt").mockResolvedValue({
      name: "skill-one",
      description: "desc"
    });
    await runInit({
      verbose: false,
      config: {
        skillsRepo: { url: "git@github.com:<org>/xixi-skills.git" },
        depts: ["engineering"]
      }
    });
    expect(await fs.pathExists(path.join(cwd, "skills", "skill-one", "SKILL.md"))).toBe(true);
    expect(await fs.pathExists(path.join(cwd, "skills", "skill-one", "agents", "openai.yaml"))).toBe(true);
  });
});
