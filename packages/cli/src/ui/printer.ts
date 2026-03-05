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

  printInfo("Installed skills:\n");
  for (const key of keys.sort()) {
    const record = index[key];
    printInfo(`- ${key}  ${record.description}`);
  }
}
