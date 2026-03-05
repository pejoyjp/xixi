import { Command } from "commander";
import { toUserMessage } from "@xixi/core";
import { runInit } from "./commands/init";
import { runPublish } from "./commands/publish";
import { runInstall } from "./commands/install";
import { runView } from "./commands/view";
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
  .description("Create a skill scaffold in current directory")
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
  .option("--path <dir>", "Skill root path", ".")
  .option("--dept <dept>", "Target department")
  .option("--force", "Overwrite existing remote skill")
  .action(async (options: { path?: string; dept?: string; force?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runPublish(runtime, options);
    });
  });

program
  .command("install")
  .description("Install a skill from remote repo")
  .argument("<dept/name>", "Skill identifier")
  .option("--ref <gitRef>", "Git ref to install")
  .option("--global", "Reserved for future project-level installs", true)
  .action(async (deptName: string, options: { ref?: string; global?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      const runtime = await buildRuntime(verbose);
      await runInstall(runtime, deptName, options);
    });
  });

program
  .command("view")
  .description("View installed skills")
  .option("--dept <dept>", "Filter by dept")
  .option("--name <substring>", "Filter by name substring")
  .option("--json", "Output JSON")
  .action(async (options: { dept?: string; name?: string; json?: boolean }) => {
    const verbose = Boolean(program.opts<{ verbose?: boolean }>().verbose);
    await withErrorHandling(verbose, async () => {
      await runView(options);
    });
  });

void program.parseAsync(process.argv);

