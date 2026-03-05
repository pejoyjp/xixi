import path from "node:path";
import fs from "fs-extra";
import { z } from "zod";
import { CONFIG_FILENAME, DEFAULT_DEPTS, DEFAULT_SKILLS_REPO_URL } from "./constants";
import { XixiError } from "./errors";
import { getConfigPath, getInstallRoot, getTmpRoot, getXixiHomeDir } from "./paths";
import { XixiConfig } from "./types";

const configSchema = z.object({
  skillsRepo: z.object({
    url: z.string().min(1),
    defaultBranch: z.string().min(1).optional()
  }),
  installRoot: z.string().min(1).optional(),
  tmpRoot: z.string().min(1).optional(),
  depts: z.array(z.string().min(1)).optional()
});

export function getDefaultConfig(): XixiConfig {
  const xixiHome = getXixiHomeDir();
  return {
    skillsRepo: {
      url: DEFAULT_SKILLS_REPO_URL
    },
    installRoot: path.join(xixiHome, "installed"),
    tmpRoot: getTmpRoot({
      skillsRepo: { url: DEFAULT_SKILLS_REPO_URL }
    }),
    depts: [...DEFAULT_DEPTS]
  };
}

export async function loadOrCreateConfig(): Promise<{ config: XixiConfig; path: string; created: boolean }> {
  const configPath = getConfigPath();
  const xixiHome = getXixiHomeDir();
  await fs.ensureDir(xixiHome);

  if (!(await fs.pathExists(configPath))) {
    const defaults = getDefaultConfig();
    await fs.writeJson(configPath, defaults, { spaces: 2 });
    return { config: defaults, path: configPath, created: true };
  }

  try {
    const loaded = await fs.readJson(configPath);
    const parsed = configSchema.parse(loaded);
    return { config: parsed, path: configPath, created: false };
  } catch (error) {
    throw new XixiError(
      "CONFIG_INVALID",
      `Failed to load config from ${configPath}`,
      `Fix ${CONFIG_FILENAME} and rerun.`,
      error
    );
  }
}

export function resolveDeptList(config: XixiConfig): string[] {
  const fromConfig = config.depts?.filter(Boolean) ?? [];
  if (fromConfig.length > 0) {
    return fromConfig;
  }
  return [...DEFAULT_DEPTS];
}

export function getResolvedInstallRoot(config: XixiConfig): string {
  return getInstallRoot(config);
}

