#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");
var import_core9 = require("@xixi/core");

// src/commands/init.ts
var import_node_path = __toESM(require("path"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_js_yaml = __toESM(require("js-yaml"));
var import_inquirer = __toESM(require("inquirer"));
var import_core = require("@xixi/core");

// src/ui/printer.ts
var import_chalk = __toESM(require("chalk"));
function printInfo(message) {
  console.log(message);
}
function printSuccess(message) {
  console.log(import_chalk.default.green(message));
}
function printError(message) {
  console.error(import_chalk.default.red(message));
}
function printInstalled(index) {
  const keys = Object.keys(index);
  if (keys.length === 0) {
    printInfo("No installed skills.");
    return;
  }
  printInfo("Installed skills:\n");
  for (const key of keys.sort()) {
    const record = index[key];
    printInfo(`- ${key}  ${record.description}`);
  }
}

// src/commands/init.ts
async function runInit(context) {
  void context;
  const answers = await import_inquirer.default.prompt([
    {
      type: "input",
      name: "name",
      message: "Skill name (kebab-case)",
      validate(value) {
        return (0, import_core.isKebabCase)(value) ? true : "Name must be kebab-case.";
      }
    },
    {
      type: "input",
      name: "description",
      message: "Description"
    }
  ]);
  const skillDir = import_node_path.default.resolve(process.cwd(), "skills", answers.name);
  if (await import_fs_extra.default.pathExists(skillDir)) {
    throw new import_core.XixiError("SKILL_EXISTS", `Directory already exists: ${skillDir}`);
  }
  const normalizedDescription = answers.description || "Describe this skill briefly";
  const title = answers.name.split("-").filter(Boolean).map((token) => token[0]?.toUpperCase() + token.slice(1)).join(" ");
  const skillMarkdown = [
    "---",
    `name: ${answers.name}`,
    `description: ${normalizedDescription}`,
    "---",
    "",
    `# ${title || answers.name}`,
    "",
    "## When to use this skill",
    "Use this skill when the user needs this workflow.",
    "",
    "## How to use",
    "1. Describe the expected input.",
    "2. Describe the key steps.",
    "3. Describe the expected output."
  ].join("\n");
  const openaiMetadata = {
    interface: {
      display_name: title || answers.name,
      short_description: normalizedDescription,
      default_prompt: `Use the ${answers.name} skill to complete the requested workflow.`
    }
  };
  await import_fs_extra.default.ensureDir(import_node_path.default.join(skillDir, "agents"));
  await import_fs_extra.default.writeFile(import_node_path.default.join(skillDir, "SKILL.md"), skillMarkdown, "utf8");
  await import_fs_extra.default.writeFile(import_node_path.default.join(skillDir, "agents", "openai.yaml"), import_js_yaml.default.dump(openaiMetadata), "utf8");
  printSuccess(`Created skill scaffold at ${skillDir}`);
  printInfo(`Next step: cd skills/${answers.name} && xixi publish --path .`);
}

// src/commands/publish.ts
var import_node_path4 = __toESM(require("path"));
var import_fs_extra5 = __toESM(require("fs-extra"));
var import_inquirer2 = __toESM(require("inquirer"));
var import_core4 = require("@xixi/core");

// src/services/repo-service.ts
var import_fs_extra4 = __toESM(require("fs-extra"));
var import_node_os = __toESM(require("os"));
var import_node_path3 = __toESM(require("path"));
var import_core3 = require("@xixi/core");

// src/services/git-service.ts
var import_fs_extra2 = __toESM(require("fs-extra"));
var import_node_path2 = __toESM(require("path"));
var import_simple_git = __toESM(require("simple-git"));
var import_core2 = require("@xixi/core");
async function detectDefaultBranch(repoUrl) {
  try {
    const git = (0, import_simple_git.default)();
    const output = await git.raw(["ls-remote", "--symref", repoUrl, "HEAD"]);
    const line = output.split("\n").map((item) => item.trim()).find((item) => item.startsWith("ref:"));
    if (!line) {
      return "main";
    }
    const match = line.match(/refs\/heads\/([^\s]+)/);
    return match?.[1] ?? "main";
  } catch (error) {
    throw new import_core2.XixiError("GIT_CLONE_FAILED", `Failed to detect default branch from ${repoUrl}`, void 0, error);
  }
}
async function cloneRepoShallow(repoUrl, dir, branch) {
  try {
    await import_fs_extra2.default.ensureDir(import_node_path2.default.dirname(dir));
    const git = (0, import_simple_git.default)();
    const args = ["--depth", "1"];
    if (branch) {
      args.push("--branch", branch);
    }
    await git.clone(repoUrl, dir, args);
    return (0, import_simple_git.default)(dir);
  } catch (error) {
    throw new import_core2.XixiError("GIT_CLONE_FAILED", `Failed to clone repo: ${repoUrl}`, "Check git auth and repo URL.", error);
  }
}
async function checkout(git, ref) {
  try {
    await git.checkout(ref);
  } catch (error) {
    throw new import_core2.XixiError("GIT_CLONE_FAILED", `Failed to checkout ref: ${ref}`, void 0, error);
  }
}
async function getCurrentCommit(git) {
  return git.revparse(["HEAD"]);
}
async function commitAndPush(git, message, branch) {
  try {
    await git.add(".");
    await git.commit(message);
    await git.push("origin", branch);
    return await getCurrentCommit(git);
  } catch (error) {
    throw new import_core2.XixiError(
      "GIT_PUSH_FAILED",
      "Failed to push changes to remote repository.",
      "You may need write access or fork the repo first. PR mode will be supported in future versions.",
      error
    );
  }
}

// src/services/file-service.ts
var import_fs_extra3 = __toESM(require("fs-extra"));
async function copyDir(sourcePath, targetPath) {
  await import_fs_extra3.default.copy(sourcePath, targetPath, {
    overwrite: true,
    recursive: true,
    filter: (src) => !src.includes(`${process.platform === "win32" ? "\\" : "/"}node_modules${process.platform === "win32" ? "\\" : "/"}`)
  });
}

// src/services/repo-service.ts
function tempDir(prefix, root) {
  return import_fs_extra4.default.mkdtemp(import_node_path3.default.join(root ?? import_node_os.default.tmpdir(), `${prefix}-`));
}
async function publishToRepo(input) {
  const branch = input.config.skillsRepo.defaultBranch ?? await detectDefaultBranch(input.config.skillsRepo.url);
  const tmp = await tempDir("xixi-publish", input.config.tmpRoot);
  try {
    const git = await cloneRepoShallow(input.config.skillsRepo.url, tmp, branch);
    const targetPath = import_node_path3.default.join(tmp, "skills", input.name);
    const exists = await import_fs_extra4.default.pathExists(targetPath);
    if (exists && !input.force) {
      throw new import_core3.XixiError(
        "SKILL_EXISTS",
        `Skill already exists in remote repo: skills/${input.name}`,
        "Use --force to overwrite."
      );
    }
    if (exists && input.force) {
      await import_fs_extra4.default.remove(targetPath);
    }
    await import_fs_extra4.default.ensureDir(import_node_path3.default.dirname(targetPath));
    await copyDir(input.skillRoot, targetPath);
    const commitHash = await commitAndPush(git, `feat(skills): publish ${input.name}`, branch);
    return {
      targetPath: `skills/${input.name}`,
      commitHash,
      branch
    };
  } finally {
    await import_fs_extra4.default.remove(tmp);
  }
}
async function listRemoteSkills(config, ref) {
  const branch = ref ?? config.skillsRepo.defaultBranch ?? await detectDefaultBranch(config.skillsRepo.url);
  const tmp = await tempDir("xixi-remote", config.tmpRoot);
  try {
    const git = await cloneRepoShallow(config.skillsRepo.url, tmp, branch);
    if (ref) {
      await checkout(git, ref);
    }
    const skillsRoot = import_node_path3.default.join(tmp, "skills");
    if (!await import_fs_extra4.default.pathExists(skillsRoot)) {
      return [];
    }
    const entries = await import_fs_extra4.default.readdir(skillsRoot, { withFileTypes: true });
    return entries.filter((item) => item.isDirectory() && !item.name.startsWith(".")).map((item) => item.name).sort();
  } finally {
    await import_fs_extra4.default.remove(tmp);
  }
}
async function installFromRepo(input) {
  const branch = input.ref ?? input.config.skillsRepo.defaultBranch ?? await detectDefaultBranch(input.config.skillsRepo.url);
  const tmp = await tempDir("xixi-install", input.config.tmpRoot);
  const git = await cloneRepoShallow(input.config.skillsRepo.url, tmp, branch);
  if (input.ref) {
    await checkout(git, input.ref);
  }
  const stagedSkillPath = import_node_path3.default.join(tmp, "skills", input.name);
  if (!await import_fs_extra4.default.pathExists(stagedSkillPath)) {
    await import_fs_extra4.default.remove(tmp);
    throw new import_core3.XixiError("SKILL_NOT_FOUND", `Skill not found: skills/${input.name}`);
  }
  const commitHash = await getCurrentCommit(git);
  return {
    stagedSkillPath,
    commitHash,
    repoUrl: input.config.skillsRepo.url,
    cleanup: async () => import_fs_extra4.default.remove(tmp)
  };
}
function getInstalledSkillPath(config, name) {
  return import_node_path3.default.join((0, import_core3.getResolvedInstallRoot)(config), name);
}

// src/commands/publish.ts
async function isSkillRoot(candidate) {
  return import_fs_extra5.default.pathExists(import_node_path4.default.join(candidate, "SKILL.md"));
}
async function resolvePublishRoot(context, options) {
  if (options.path) {
    return import_node_path4.default.resolve(process.cwd(), options.path);
  }
  if (options.name) {
    if (options.name.includes("/")) {
      throw new import_core4.XixiError("MANIFEST_INVALID", "Publish skill name must be <name>.");
    }
    const skillPath = import_node_path4.default.join((0, import_core4.getResolvedInstallRoot)(context.config), options.name);
    if (!await import_fs_extra5.default.pathExists(skillPath)) {
      throw new import_core4.XixiError("SKILL_NOT_FOUND", `Installed skill not found: ${skillPath}`);
    }
    return skillPath;
  }
  const cwdRoot = import_node_path4.default.resolve(process.cwd(), ".");
  if (await isSkillRoot(cwdRoot)) {
    return cwdRoot;
  }
  const installRoot = (0, import_core4.getResolvedInstallRoot)(context.config);
  if (!await import_fs_extra5.default.pathExists(installRoot)) {
    throw new import_core4.XixiError(
      "MANIFEST_INVALID",
      `Missing manifest: ${import_node_path4.default.join(cwdRoot, "SKILL.md")}`,
      "Run inside a skill directory, or use `xixi publish <name>` / `xixi publish --path <dir>`."
    );
  }
  const entries = await import_fs_extra5.default.readdir(installRoot, { withFileTypes: true });
  const skillNames = entries.filter((item) => item.isDirectory() && !item.name.startsWith(".")).map((item) => item.name).sort();
  if (skillNames.length === 0) {
    throw new import_core4.XixiError(
      "SKILL_NOT_FOUND",
      `No installed skills found in ${installRoot}`,
      "Install one first or pass --path."
    );
  }
  if (skillNames.length === 1) {
    return import_node_path4.default.join(installRoot, skillNames[0]);
  }
  if (!process.stdin.isTTY) {
    throw new import_core4.XixiError(
      "NON_TTY_CONFIRM_REQUIRED",
      "Multiple installed skills found. Please specify one.",
      "Use `xixi publish <name>` or `xixi publish --path <dir>`."
    );
  }
  const answer = await import_inquirer2.default.prompt([
    {
      type: "list",
      name: "name",
      message: "Select installed skill to publish",
      choices: skillNames
    }
  ]);
  return import_node_path4.default.join(installRoot, answer.name);
}
async function runPublish(context, options) {
  const skillRoot = await resolvePublishRoot(context, options);
  const manifest = await (0, import_core4.loadAndValidateManifest)(skillRoot);
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

// src/commands/install.ts
var import_fs_extra6 = __toESM(require("fs-extra"));
var import_core5 = require("@xixi/core");

// src/ui/prompts.ts
var import_inquirer3 = __toESM(require("inquirer"));
async function confirm(message, defaultValue = false) {
  const answer = await import_inquirer3.default.prompt([
    {
      type: "confirm",
      name: "ok",
      message,
      default: defaultValue
    }
  ]);
  return answer.ok;
}

// src/commands/install.ts
async function runInstall(context, skillName, options) {
  if (!skillName || skillName.includes("/")) {
    throw new import_core5.XixiError("MANIFEST_INVALID", "Install target must be <name>.");
  }
  const name = skillName;
  const staged = await installFromRepo({
    config: context.config,
    name,
    ref: options.ref
  });
  try {
    const manifest = await (0, import_core5.loadAndValidateManifest)(staged.stagedSkillPath);
    const installedPath = getInstalledSkillPath(context.config, name);
    if (await import_fs_extra6.default.pathExists(installedPath)) {
      if (!process.stdin.isTTY) {
        throw new import_core5.XixiError(
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
      await import_fs_extra6.default.remove(installedPath);
    }
    await import_fs_extra6.default.ensureDir(installedPath);
    await copyDir(staged.stagedSkillPath, installedPath);
    const key = name;
    await (0, import_core5.upsertIndexRecord)(key, {
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

// src/commands/uninstall.ts
var import_fs_extra7 = __toESM(require("fs-extra"));
var import_core6 = require("@xixi/core");
async function runUninstall(context, skillName, options) {
  if (!skillName || skillName.includes("/")) {
    throw new import_core6.XixiError("MANIFEST_INVALID", "Uninstall target must be <name>.");
  }
  const installedPath = getInstalledSkillPath(context.config, skillName);
  const exists = await import_fs_extra7.default.pathExists(installedPath);
  if (!exists) {
    throw new import_core6.XixiError("SKILL_NOT_FOUND", `Installed skill not found: ${installedPath}`);
  }
  if (!options.force) {
    if (!process.stdin.isTTY) {
      throw new import_core6.XixiError(
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
  await import_fs_extra7.default.remove(installedPath);
  await (0, import_core6.removeIndexRecord)(skillName);
  printSuccess(`Uninstalled ${skillName}`);
  printInfo(`Removed path: ${installedPath}`);
}

// src/commands/view.ts
var import_core7 = require("@xixi/core");
async function runView(options) {
  const index = await (0, import_core7.readIndex)();
  const filteredEntries = Object.entries(index).filter(([key, value]) => {
    if (options.name && !key.includes(options.name) && !value.name.includes(options.name)) {
      return false;
    }
    return true;
  });
  const filtered = Object.fromEntries(filteredEntries);
  if (options.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }
  printInstalled(filtered);
}

// src/commands/remote.ts
async function runRemote(context, options) {
  const skills = await listRemoteSkills(context.config, options.ref);
  const filtered = options.name ? skills.filter((item) => item.includes(options.name)) : skills;
  if (options.json) {
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }
  if (filtered.length === 0) {
    printInfo("No remote skills found.");
    return;
  }
  printInfo("Remote skills:\n");
  for (const name of filtered) {
    printInfo(`- ${name}`);
  }
}

// src/utils/runtime.ts
var import_core8 = require("@xixi/core");
async function buildRuntime(verbose) {
  const loaded = await (0, import_core8.loadOrCreateConfig)();
  if (loaded.created) {
    printInfo(`Created default config at ${loaded.path}`);
  }
  return {
    verbose,
    config: loaded.config
  };
}

// src/index.ts
async function withErrorHandling(verbose, fn) {
  try {
    return await fn();
  } catch (error) {
    printError((0, import_core9.toUserMessage)(error, verbose));
    process.exitCode = 1;
  }
}
var program = new import_commander.Command();
program.name("xixi").description("Company Skill CLI").option("--verbose", "Print verbose logs");
program.command("init").description("Create a skill scaffold in ./skills/<name>").action(async () => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    const runtime = await buildRuntime(verbose);
    await runInit(runtime);
  });
});
program.command("publish").description("Publish current skill to shared repo").argument("[name]", "Installed skill name under ~/.codex/skills").option("--path <dir>", "Skill root path").option("--force", "Overwrite existing remote skill").action(async (name, options) => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    const runtime = await buildRuntime(verbose);
    await runPublish(runtime, { ...options, name });
  });
});
program.command("install").description("Install a skill from remote repo").argument("<name>", "Skill name").option("--ref <gitRef>", "Git ref to install").option("--global", "Reserved for future project-level installs", true).action(async (name, options) => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    const runtime = await buildRuntime(verbose);
    await runInstall(runtime, name, options);
  });
});
program.command("uninstall").description("Uninstall a skill from local ~/.codex/skills").argument("<name>", "Skill name").option("--force", "Uninstall without confirmation").action(async (name, options) => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    const runtime = await buildRuntime(verbose);
    await runUninstall(runtime, name, options);
  });
});
program.command("view").description("View installed skills").option("--name <substring>", "Filter by name substring").option("--json", "Output JSON").action(async (options) => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    await runView(options);
  });
});
program.command("remote").description("List skills from remote repo").option("--ref <gitRef>", "Git ref to query").option("--name <substring>", "Filter by skill name substring").option("--json", "Output JSON").action(async (options) => {
  const verbose = Boolean(program.opts().verbose);
  await withErrorHandling(verbose, async () => {
    const runtime = await buildRuntime(verbose);
    await runRemote(runtime, options);
  });
});
void program.parseAsync(process.argv);
//# sourceMappingURL=index.js.map