import chalk from "chalk";
import { InstalledSkillIndex } from "@xixi/core";

export function printInfo(message: string): void {
  console.log(message);
}

export function printSuccess(message: string): void {
  console.log(chalk.green(message));
}

export function printWarn(message: string): void {
  console.warn(chalk.yellow(message));
}

export function printError(message: string): void {
  console.error(chalk.red(message));
}

export function printInstalled(index: InstalledSkillIndex): void {
  const keys = Object.keys(index);
  if (keys.length === 0) {
    printInfo("No installed skills.");
    return;
  }

  const grouped = new Map<string, string[]>();
  for (const key of keys.sort()) {
    const record = index[key];
    if (!grouped.has(record.dept)) {
      grouped.set(record.dept, []);
    }
    grouped.get(record.dept)?.push(`  - ${key}  ${record.description}`);
  }

  printInfo("Installed skills:\n");
  for (const dept of [...grouped.keys()].sort()) {
    printInfo(dept);
    for (const line of grouped.get(dept) ?? []) {
      printInfo(line);
    }
    printInfo("");
  }
}

