import { Command } from "commander";
import { toUserMessage } from "@xixi/core";
import { runInit } from "./commands/init";
import { runPublish } from "./commands/publish";
import { runInstall } from "./commands/install";
import { runUninstall } from "./commands/uninstall";
import { runView } from "./commands/view";
import { runRemote } from "./commands/remote";
import { buildRuntime } from "./utils/runtime";
import { printError } from "./ui/printer";

async function withErrorHandling<T>(verbose: boolean, fn: () => Promise<T>): Promise<T | void> {
  try {
    return await fn();
  } catch (error) {
    printError(toUserMessage(error, verbose));
    process.exitCode = 1;
  }
}

const program = new Command();

program
  .name("xixi")
  .description("Company Skill CLI")
  .option("--verbose", "Print verbose logs");

program
  .command("init")
  .description("Create a skill scaffold in ./skills/<name>")
  .action(async () => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runInit(runtime);
    });
  });

program
  .command("publish")
  .description("Publish current skill to shared repo")
  .argument("[name]", "Installed skill name under ~/.codex/skills")
  .option("--path <dir>", "Skill root path")
  .option("--force", "Overwrite existing remote skill")
  .action(async (name: string | undefined, options: { path?: string; force?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runPublish(runtime, { ...options, name });
    });
  });

program
  .command("install")
  .description("Install a skill from remote repo")
  .argument("<name>", "Skill name")
  .option("--ref <gitRef>", "Git ref to install")
  .option("--global", "Reserved for future project-level installs", true)
  .action(async (name: string, options: { ref?: string; global?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runInstall(runtime, name, options);
    });
  });

program
  .command("uninstall")
  .description("Uninstall a skill from local ~/.codex/skills")
  .argument("<name>", "Skill name")
  .option("--force", "Uninstall without confirmation")
  .action(async (name: string, options: { force?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runUninstall(runtime, name, options);
    });
  });

program
  .command("view")
  .description("View installed skills")
  .option("--name <substring>", "Filter by name substring")
  .option("--json", "Output JSON")
  .action(async (options: { name?: string; json?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      await runView(options);
    });
  });

program
  .command("remote")
  .description("List skills from remote repo")
  .option("--ref <gitRef>", "Git ref to query")
  .option("--name <substring>", "Filter by skill name substring")
  .option("--json", "Output JSON")
  .action(async (options: { ref?: string; name?: string; json?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runRemote(runtime, options);
    });
  });

void program.parseAsync(process.argv);
