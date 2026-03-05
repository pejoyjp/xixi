import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import inquirer from "inquirer";
import { XixiError, isKebabCase } from "@xixi/core";
import { printInfo, printSuccess } from "../ui/printer";
import { RuntimeContext } from "../utils/runtime";

export async function runInit(context: RuntimeContext): Promise<void> {
  void context;
  const answers = await inquirer.prompt<{
    name: string;
    description: string;
  }>([
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

  const skillDir = path.resolve(process.cwd(), "skills", answers.name);
  if (await fs.pathExists(skillDir)) {
    throw new XixiError("SKILL_EXISTS", `Directory already exists: ${skillDir}`);
  }

  const normalizedDescription = answers.description || "Describe this skill briefly";
  const title = answers.name
    .split("-")
    .filter(Boolean)
    .map((token) => token[0]?.toUpperCase() + token.slice(1))
    .join(" ");
  const skillMarkdown = [
    "---",
    `name: ${answers.name}`,
    `description: ${normalizedDescription}`,
    "---",
    "",
    `# ${title || answers.name}`,
    "",
    "## When to use this skill",
    "Use this skill when the user needs this workflow.",
    "",
    "## How to use",
    "1. Describe the expected input.",
    "2. Describe the key steps.",
    "3. Describe the expected output."
  ].join("\n");

  const openaiMetadata = {
    interface: {
      display_name: title || answers.name,
      short_description: normalizedDescription,
      default_prompt: `Use the ${answers.name} skill to complete the requested workflow.`
    }
  };

  await fs.ensureDir(path.join(skillDir, "agents"));
  await fs.writeFile(path.join(skillDir, "SKILL.md"), skillMarkdown, "utf8");
  await fs.writeFile(path.join(skillDir, "agents", "openai.yaml"), yaml.dump(openaiMetadata), "utf8");

  printSuccess(`Created skill scaffold at ${skillDir}`);
  printInfo(`Next step: cd skills/${answers.name} && xixi publish --path .`);
}
