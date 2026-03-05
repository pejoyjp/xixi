import fs from "fs-extra";
import path from "node:path";
import simpleGit, { SimpleGit } from "simple-git";
import { XixiError } from "@xixi/core";

export async function detectDefaultBranch(repoUrl: string): Promise<string> {
  try {
    const git = simpleGit();
    const output = await git.raw(["ls-remote", "--symref", repoUrl, "HEAD"]);
    const line = output
      .split("\n")
      .map((item) => item.trim())
      .find((item) => item.startsWith("ref:"));
    if (!line) {
      return "main";
    }
    const match = line.match(/refs\/heads\/([^\s]+)/);
    return match?.[1] ?? "main";
  } catch (error) {
    throw new XixiError("GIT_CLONE_FAILED", `Failed to detect default branch from ${repoUrl}`, undefined, error);
  }
}

export async function cloneRepoShallow(repoUrl: string, dir: string, branch?: string): Promise<SimpleGit> {
  try {
    await fs.ensureDir(path.dirname(dir));
    const git = simpleGit();
    const args = ["--depth", "1"];
    if (branch) {
      args.push("--branch", branch);
    }
    await git.clone(repoUrl, dir, args);
    return simpleGit(dir);
  } catch (error) {
    throw new XixiError("GIT_CLONE_FAILED", `Failed to clone repo: ${repoUrl}`, "Check git auth and repo URL.", error);
  }
}

export async function checkout(git: SimpleGit, ref: string): Promise<void> {
  try {
    await git.checkout(ref);
  } catch (error) {
    throw new XixiError("GIT_CLONE_FAILED", `Failed to checkout ref: ${ref}`, undefined, error);
  }
}

export async function getCurrentCommit(git: SimpleGit): Promise<string> {
  return git.revparse(["HEAD"]);
}

export async function commitAndPush(git: SimpleGit, message: string, branch: string): Promise<string> {
  try {
    await git.add(".");
    await git.commit(message);
    await git.push("origin", branch);
    return await getCurrentCommit(git);
  } catch (error) {
    throw new XixiError(
      "GIT_PUSH_FAILED",
      "Failed to push changes to remote repository.",
      "You may need write access or fork the repo first. PR mode will be supported in future versions.",
      error
    );
  }
}

