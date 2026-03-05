import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import inquirer from "inquirer";
import { DEFAULT_DEPTS, XixiError, isKebabCase, resolveDeptList } from "@xixi/core";
import { listRemoteDepts } from "../services/repo-service";
import { printInfo, printSuccess, printWarn } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export async function runInit(context: RuntimeContext): Promise<void> {
  let deptList = resolveDeptList(context.config);
  try {
    const scanned = await listRemoteDepts(context.config);
    if (scanned.length > 0) {
      deptList = scanned;
    }
  } catch {
    if (deptList.length === 0) {
      deptList = [...DEFAULT_DEPTS];
    }
    printWarn("Failed to scan departments from remote repo. Using fallback depts from config/default.");
  }

  const answers = await inquirer.prompt<{
    dept: string;
    name: string;
    description: string;
  }>([
    {
      type: "list",
      name: "dept",
      message: "Select department",
      choices: deptList
    },
    {
      type: "input",
      name: "name",
      message: "Skill name (kebab-case)",
      validate(value) {
        return isKebabCase(value) ? true : "Name must be kebab-case.";
      }
    },
    {
      type: "input",
      name: "description",
      message: "Description"
    }
  ]);

  const skillDir = path.resolve(process.cwd(), answers.name);
  if (await fs.pathExists(skillDir)) {
    throw new XixiError("SKILL_EXISTS", `Directory already exists: ${skillDir}`);
  }

  await fs.ensureDir(skillDir);
  const manifest = {
    schema_version: 1,
    name: answers.name,
    dept: answers.dept,
    description: answers.description || "Describe this skill briefly",
    entry: "prompt.md"
  };

  await fs.writeFile(path.join(skillDir, "xixi.yaml"), yaml.dump(manifest), "utf8");
  await fs.writeFile(
    path.join(skillDir, "README.md"),
    `# ${answers.name}\n\n${manifest.description}\n\n## Usage\n\nDescribe how this skill should be used.\n`,
    "utf8"
  );
  await fs.writeFile(
    path.join(skillDir, "prompt.md"),
    [
      "# Skill Prompt",
      "",
      "## Input",
      "- Describe expected inputs here.",
      "",
      "## Output",
      "- Describe expected output format here.",
      "",
      "## Notes",
      "- Add constraints and examples as needed."
    ].join("\n"),
    "utf8"
  );

  printSuccess(`Created skill scaffold at ${skillDir}`);
  printInfo(`Next step: cd ${answers.name} && xixi publish`);
}

