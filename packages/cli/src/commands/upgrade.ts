import fs from "fs-extra";
import { XixiError, loadAndValidateManifest, readIndex, upsertIndexRecord } from "@xixi/core";
import { copyDir } from "../services/file-service";
import { getInstalledSkillPath, installFromRepo } from "../services/repo-service";
import { confirm } from "../ui/prompts";
import { printInfo, printSuccess, printWarn } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export type UpgradeOptions = {
  ref?: string;
  force?: boolean;
  all?: boolean;
};

async function upgradeOne(context: RuntimeContext, name: string, ref?: string): Promise<void> {
  const installedPath = getInstalledSkillPath(context.config, name);
  if (!(await fs.pathExists(installedPath))) {
    throw new XixiError("SKILL_NOT_FOUND", `Installed skill not found: ${installedPath}`);
  }

  const staged = await installFromRepo({
    config: context.config,
    name,
    ref
  });

  try {
    const manifest = await loadAndValidateManifest(staged.stagedSkillPath);
    await fs.remove(installedPath);
    await fs.ensureDir(installedPath);
    await copyDir(staged.stagedSkillPath, installedPath);

    await upsertIndexRecord(name, {
      name,
      description: manifest.description,
      installedPath,
      source: {
        repo: staged.repoUrl,
        ref: staged.commitHash
      }
    });

    printSuccess(`Upgraded ${name} -> ${staged.commitHash}`);
  } finally {
    await staged.cleanup();
  }
}

export async function runUpgrade(
  context: RuntimeContext,
  skillName: string | undefined,
  options: UpgradeOptions
): Promise<void> {
  if (skillName && options.all) {
    throw new XixiError("MANIFEST_INVALID", "Use either <name> or --all, not both.");
  }

  const index = await readIndex();
  const installedNames = Object.keys(index).sort();
  if (installedNames.length === 0) {
    printInfo("No installed skills to upgrade.");
    return;
  }

  let targets: string[];
  if (skillName) {
    if (skillName.includes("/")) {
      throw new XixiError("MANIFEST_INVALID", "Upgrade target must be <name>.");
    }
    targets = [skillName];
  } else {
    targets = installedNames;
  }

  if (!options.force) {
    if (!process.stdin.isTTY) {
      throw new XixiError(
        "NON_TTY_CONFIRM_REQUIRED",
        `Ready to upgrade ${targets.length} skill(s).`,
        "Run in interactive terminal to confirm, or pass --force."
      );
    }
    const shouldUpgrade = await confirm(
      `Upgrade ${targets.length} skill(s) from remote latest${options.ref ? ` at ref ${options.ref}` : ""}?`,
      true
    );
    if (!shouldUpgrade) {
      printInfo("Upgrade cancelled.");
      return;
    }
  }

  let failures = 0;
  for (const name of targets) {
    try {
      await upgradeOne(context, name, options.ref);
    } catch (error) {
      failures += 1;
      const message = error instanceof Error ? error.message : String(error);
      printWarn(`Failed to upgrade ${name}: ${message}`);
    }
  }

  if (failures > 0) {
    throw new XixiError("SKILL_NOT_FOUND", `Upgrade completed with ${failures} failure(s).`);
  }
}
