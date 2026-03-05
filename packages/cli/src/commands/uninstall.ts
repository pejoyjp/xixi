import fs from "fs-extra";
import { XixiError, removeIndexRecord } from "@xixi/core";
import { getInstalledSkillPath } from "../services/repo-service";
import { confirm } from "../ui/prompts";
import { printInfo, printSuccess } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export type UninstallOptions = {
  force?: boolean;
};

export async function runUninstall(
  context: RuntimeContext,
  skillName: string,
  options: UninstallOptions
): Promise<void> {
  if (!skillName || skillName.includes("/")) {
    throw new XixiError("MANIFEST_INVALID", "Uninstall target must be <name>.");
  }

  const installedPath = getInstalledSkillPath(context.config, skillName);
  const exists = await fs.pathExists(installedPath);
  if (!exists) {
    throw new XixiError("SKILL_NOT_FOUND", `Installed skill not found: ${installedPath}`);
  }

  if (!options.force) {
    if (!process.stdin.isTTY) {
      throw new XixiError(
        "NON_TTY_CONFIRM_REQUIRED",
        `Skill exists at ${installedPath}`,
        "Run in interactive terminal to confirm uninstall, or pass --force."
      );
    }
    const shouldRemove = await confirm(`Uninstall skill at ${installedPath}?`, false);
    if (!shouldRemove) {
      printInfo("Uninstall cancelled.");
      return;
    }
  }

  await fs.remove(installedPath);
  await removeIndexRecord(skillName);

  printSuccess(`Uninstalled ${skillName}`);
  printInfo(`Removed path: ${installedPath}`);
}
