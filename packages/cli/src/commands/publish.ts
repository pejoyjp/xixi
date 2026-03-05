import path from "node:path";
import fs from "fs-extra";
import inquirer from "inquirer";
import { XixiError, getResolvedInstallRoot, loadAndValidateManifest } from "@xixi/core";
import { publishToRepo } from "../services/repo-service";
import { printInfo, printSuccess } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export type PublishOptions = {
  name?: string;
  path?: string;
  force?: boolean;
};

async function isSkillRoot(candidate: string): Promise<boolean> {
  return fs.pathExists(path.join(candidate, "SKILL.md"));
}

async function resolvePublishRoot(context: RuntimeContext, options: PublishOptions): Promise<string> {
  if (options.path) {
    return path.resolve(process.cwd(), options.path);
  }
  if (options.name) {
    if (options.name.includes("/")) {
      throw new XixiError("MANIFEST_INVALID", "Publish skill name must be <name>.");
    }
    const skillPath = path.join(getResolvedInstallRoot(context.config), options.name);
    if (!(await fs.pathExists(skillPath))) {
      throw new XixiError("SKILL_NOT_FOUND", `Installed skill not found: ${skillPath}`);
    }
    return skillPath;
  }

  const cwdRoot = path.resolve(process.cwd(), ".");
  if (await isSkillRoot(cwdRoot)) {
    return cwdRoot;
  }

  const installRoot = getResolvedInstallRoot(context.config);
  if (!(await fs.pathExists(installRoot))) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Missing manifest: ${path.join(cwdRoot, "SKILL.md")}`,
      "Run inside a skill directory, or use `xixi publish <name>` / `xixi publish --path <dir>`."
    );
  }

  const entries = await fs.readdir(installRoot, { withFileTypes: true });
  const skillNames = entries
    .filter((item) => item.isDirectory() && !item.name.startsWith("."))
    .map((item) => item.name)
    .sort();

  if (skillNames.length === 0) {
    throw new XixiError(
      "SKILL_NOT_FOUND",
      `No installed skills found in ${installRoot}`,
      "Install one first or pass --path."
    );
  }

  if (skillNames.length === 1) {
    return path.join(installRoot, skillNames[0]);
  }

  if (!process.stdin.isTTY) {
    throw new XixiError(
      "NON_TTY_CONFIRM_REQUIRED",
      "Multiple installed skills found. Please specify one.",
      "Use `xixi publish <name>` or `xixi publish --path <dir>`."
    );
  }

  const answer = await inquirer.prompt<{ name: string }>([
    {
      type: "list",
      name: "name",
      message: "Select installed skill to publish",
      choices: skillNames
    }
  ]);
  return path.join(installRoot, answer.name);
}

export async function runPublish(context: RuntimeContext, options: PublishOptions): Promise<void> {
  const skillRoot = await resolvePublishRoot(context, options);
  const manifest = await loadAndValidateManifest(skillRoot);

  const result = await publishToRepo({
    config: context.config,
    name: manifest.name,
    skillRoot,
    force: Boolean(options.force)
  });

  printSuccess(`Published ${manifest.name}`);
  printInfo(`Remote path: ${result.targetPath}`);
  printInfo(`Commit: ${result.commitHash}`);
}
