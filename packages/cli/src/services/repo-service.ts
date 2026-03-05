import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { XixiConfig, XixiError, getResolvedInstallRoot } from "@xixi/core";
import { cloneRepoShallow, commitAndPush, detectDefaultBranch, getCurrentCommit, checkout } from "./git-service";
import { copyDir } from "./file-service";

function tempDir(prefix: string, root?: string): Promise<string> {
  return fs.mkdtemp(path.join(root ?? os.tmpdir(), `${prefix}-`));
}

export async function listRemoteDepts(config: XixiConfig): Promise<string[]> {
  const branch = config.skillsRepo.defaultBranch ?? (await detectDefaultBranch(config.skillsRepo.url));
  const tmp = await tempDir("xixi-depts", config.tmpRoot);
  try {
    await cloneRepoShallow(config.skillsRepo.url, tmp, branch);
    const entries = await fs.readdir(tmp, { withFileTypes: true });
    return entries
      .filter((item) => item.isDirectory() && !item.name.startsWith(".") && item.name !== ".git")
      .map((item) => item.name)
      .sort();
  } finally {
    await fs.remove(tmp);
  }
}

export async function publishToRepo(input: {
  config: XixiConfig;
  dept: string;
  name: string;
  skillRoot: string;
  force: boolean;
}): Promise<{ targetPath: string; commitHash: string; branch: string }> {
  const branch = input.config.skillsRepo.defaultBranch ?? (await detectDefaultBranch(input.config.skillsRepo.url));
  const tmp = await tempDir("xixi-publish", input.config.tmpRoot);
  try {
    const git = await cloneRepoShallow(input.config.skillsRepo.url, tmp, branch);
    const targetPath = path.join(tmp, input.dept, input.name);
    const exists = await fs.pathExists(targetPath);
    if (exists && !input.force) {
      throw new XixiError(
        "SKILL_EXISTS",
        `Skill already exists in remote repo: ${input.dept}/${input.name}`,
        "Use --force to overwrite."
      );
    }

    if (exists && input.force) {
      await fs.remove(targetPath);
    }

    await fs.ensureDir(path.dirname(targetPath));
    await copyDir(input.skillRoot, targetPath);
    const commitHash = await commitAndPush(git, `feat(${input.dept}): publish ${input.name}`, branch);
    return {
      targetPath: `${input.dept}/${input.name}`,
      commitHash,
      branch
    };
  } finally {
    await fs.remove(tmp);
  }
}

export async function installFromRepo(input: {
  config: XixiConfig;
  dept: string;
  name: string;
  ref?: string;
}): Promise<{ stagedSkillPath: string; commitHash: string; repoUrl: string; cleanup: () => Promise<void> }> {
  const branch = input.ref ?? input.config.skillsRepo.defaultBranch ?? (await detectDefaultBranch(input.config.skillsRepo.url));
  const tmp = await tempDir("xixi-install", input.config.tmpRoot);
  const git = await cloneRepoShallow(input.config.skillsRepo.url, tmp, branch);
  if (input.ref) {
    await checkout(git, input.ref);
  }
  const stagedSkillPath = path.join(tmp, input.dept, input.name);
  if (!(await fs.pathExists(stagedSkillPath))) {
    await fs.remove(tmp);
    throw new XixiError("SKILL_NOT_FOUND", `Skill not found: ${input.dept}/${input.name}`);
  }

  const commitHash = await getCurrentCommit(git);
  return {
    stagedSkillPath,
    commitHash,
    repoUrl: input.config.skillsRepo.url,
    cleanup: async () => fs.remove(tmp)
  };
}

export function getInstalledSkillPath(config: XixiConfig, dept: string, name: string): string {
  return path.join(getResolvedInstallRoot(config), dept, name);
}

