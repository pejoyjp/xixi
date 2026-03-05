import path from "node:path";
import { XixiError, loadAndValidateManifest, resolveDeptList } from "@xixi/core";
import { publishToRepo } from "../services/repo-service";
import { selectDept } from "../ui/prompts";
import { printInfo, printSuccess } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export type PublishOptions = {
  path?: string;
  dept?: string;
  force?: boolean;
};

export async function runPublish(context: RuntimeContext, options: PublishOptions): Promise<void> {
  const skillRoot = path.resolve(process.cwd(), options.path ?? ".");
  const deptList = resolveDeptList(context.config);
  const manifest = await loadAndValidateManifest(skillRoot, deptList);

  const selectedDept = options.dept ?? (await selectDept(deptList, "Select department for publish"));
  if (selectedDept !== manifest.dept) {
    throw new XixiError(
      "DEPT_MISMATCH",
      `Selected dept "${selectedDept}" does not match manifest.dept "${manifest.dept}".`,
      "Use --dept matching xixi.yaml or update manifest.dept."
    );
  }

  const result = await publishToRepo({
    config: context.config,
    dept: manifest.dept,
    name: manifest.name,
    skillRoot,
    force: Boolean(options.force)
  });

  printSuccess(`Published ${manifest.dept}/${manifest.name}`);
  printInfo(`Remote path: ${result.targetPath}`);
  printInfo(`Commit: ${result.commitHash}`);
}

