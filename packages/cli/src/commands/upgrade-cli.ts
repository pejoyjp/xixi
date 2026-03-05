import { spawnSync } from "node:child_process";
import { XixiError } from "@xixi/core";
import { printInfo, printSuccess } from "../ui/printer";

const DEFAULT_SOURCE = "https://codeload.github.com/pejoyjp/xixi/tar.gz/refs/heads/main";

export type UpgradeCliOptions = {
  source?: string;
};

type UpgradeCliRunner = (command: string, args: string[]) => {
  status: number | null;
  error?: Error;
};

const defaultRunner: UpgradeCliRunner = (command, args) =>
  spawnSync(command, args, {
    stdio: "inherit",
    shell: false
  });

export async function runUpgradeCli(
  options: UpgradeCliOptions,
  deps?: {
    runner?: UpgradeCliRunner;
  }
): Promise<void> {
  const runner = deps?.runner ?? defaultRunner;
  const source = options.source?.trim() || DEFAULT_SOURCE;
  printInfo(`Upgrading xixi CLI from ${source}`);

  const result = runner("npm", ["install", "-g", source]);

  if (result.error) {
    throw new XixiError(
      "CLI_UPGRADE_FAILED",
      `Failed to run npm install: ${result.error.message}`,
      "Ensure npm is installed and retry."
    );
  }

  if (typeof result.status === "number" && result.status !== 0) {
    throw new XixiError(
      "CLI_UPGRADE_FAILED",
      `Upgrade command exited with status ${result.status}`,
      "If permission is denied, rerun with sudo or fix npm global permissions."
    );
  }

  printSuccess("xixi CLI upgraded successfully.");
}
