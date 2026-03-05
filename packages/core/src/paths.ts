import os from "node:os";
import path from "node:path";
import { CONFIG_FILENAME, INDEX_FILENAME, XIXI_DIRNAME } from "./constants";
import { XixiConfig } from "./types";

export function getXixiHomeDir(): string {
  return path.join(os.homedir(), XIXI_DIRNAME);
}

export function getConfigPath(): string {
  return path.join(getXixiHomeDir(), CONFIG_FILENAME);
}

export function getIndexPath(): string {
  return path.join(getXixiHomeDir(), INDEX_FILENAME);
}

export function getDefaultInstallRoot(): string {
  return path.join(os.homedir(), ".codex", "skills");
}

export function getInstallRoot(config: XixiConfig): string {
  return config.installRoot ?? getDefaultInstallRoot();
}

export function getTmpRoot(config: XixiConfig): string {
  return config.tmpRoot ?? os.tmpdir();
}
