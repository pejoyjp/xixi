import { XixiConfig, loadOrCreateConfig } from "@xixi/core";
import { printInfo } from "../ui/printer";

export type RuntimeContext = {
  verbose: boolean;
  config: XixiConfig;
};

export async function buildRuntime(verbose: boolean): Promise<RuntimeContext> {
  const loaded = await loadOrCreateConfig();
  if (loaded.created) {
    printInfo(`Created default config at ${loaded.path}`);
  }
  return {
    verbose,
    config: loaded.config
  };
}

