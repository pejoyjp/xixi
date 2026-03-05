import fs from "fs-extra";
import {
  XixiError,
  loadAndValidateManifest,
  upsertIndexRecord
} from "@xixi/core";
import { copyDir } from "../services/file-service";
import { getInstalledSkillPath, installFromRepo } from "../services/repo-service";
import { confirm } from "../ui/prompts";
import { printInfo, printSuccess } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export type InstallOptions = {
  ref?: string;
  global?: boolean;
};

export async function runInstall(
  context: RuntimeContext,
  skillName: string,
  options: InstallOptions
): Promise<void> {
  if (!skillName || skillName.includes("/")) {
    throw new XixiError("MANIFEST_INVALID", "Install target must be <name>.");
  }
  const name = skillName;

  const staged = await installFromRepo({
    config: context.config,
    name,
    ref: options.ref
  });

  try {
    const manifest = await loadAndValidateManifest(staged.stagedSkillPath);
    const installedPath = getInstalledSkillPath(context.config, name);

    if (await fs.pathExists(installedPath)) {
      if (!process.stdin.isTTY) {
        throw new XixiError(
          "NON_TTY_CONFIRM_REQUIRED",
          `Skill already installed at ${installedPath}`,
          "Run in interactive terminal to confirm overwrite."
        );
      }
      const shouldOverwrite = await confirm(`Skill exists at ${installedPath}. Overwrite?`, false);
      if (!shouldOverwrite) {
        printInfo("Install cancelled.");
        return;
      }
      await fs.remove(installedPath);
    }

    await fs.ensureDir(installedPath);
    await copyDir(staged.stagedSkillPath, installedPath);

    const key = name;
    await upsertIndexRecord(key, {
      name,
      description: manifest.description,
      installedPath,
      source: {
        repo: staged.repoUrl,
        ref: staged.commitHash
      }
    });

    printSuccess(`Installed ${key}`);
    printInfo(`Installed path: ${installedPath}`);
  } finally {
    await staged.cleanup();
  }
}
