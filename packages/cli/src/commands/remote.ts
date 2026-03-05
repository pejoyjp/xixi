import { printInfo } from "../ui/printer";
import { listRemoteSkills } from "../services/repo-service";
import { RuntimeContext } from "../utils/runtime";

export type RemoteOptions = {
  ref?: string;
  name?: string;
  json?: boolean;
};

export async function runRemote(context: RuntimeContext, options: RemoteOptions): Promise<void> {
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
