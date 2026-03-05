import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import { z } from "zod";
import { XixiError } from "./errors";
import { XixiSkillManifestV1 } from "./types";

const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const skillFrontmatterSchema = z.object({
  name: z.string().regex(kebabCaseRegex, "name must be kebab-case"),
  description: z.string().min(1)
});

const openaiYamlSchema = z.object({
  interface: z.object({
    display_name: z.string().min(1),
    short_description: z.string().min(1),
    default_prompt: z.string().min(1)
  })
});

export const manifestFilename = "SKILL.md";
export const openaiYamlFilename = path.join("agents", "openai.yaml");

function extractFrontmatter(markdown: string): string {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match?.[1]) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Invalid ${manifestFilename}: missing YAML frontmatter.`,
      `Ensure ${manifestFilename} starts with --- and includes name/description.`
    );
  }
  return match[1];
}

export async function loadManifest(skillRoot: string): Promise<XixiSkillManifestV1> {
  const manifestPath = path.join(skillRoot, manifestFilename);
  if (!(await fs.pathExists(manifestPath))) {
    throw new XixiError("MANIFEST_INVALID", `Missing manifest: ${manifestPath}`);
  }

  try {
    const markdown = await fs.readFile(manifestPath, "utf8");
    const frontmatter = extractFrontmatter(markdown);
    const parsedYaml = yaml.load(frontmatter);
    return skillFrontmatterSchema.parse(parsedYaml);
  } catch (error) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Invalid manifest at ${manifestPath}`,
      `Check ${manifestFilename} frontmatter schema.`,
      error
    );
  }
}

export async function loadAndValidateManifest(skillRoot: string): Promise<XixiSkillManifestV1> {
  const manifest = await loadManifest(skillRoot);
  const openaiYamlPath = path.join(skillRoot, openaiYamlFilename);
  if (!(await fs.pathExists(openaiYamlPath))) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Missing metadata: ${openaiYamlPath}`,
      `Create ${openaiYamlFilename} with interface fields.`
    );
  }

  try {
    const raw = await fs.readFile(openaiYamlPath, "utf8");
    const parsedYaml = yaml.load(raw);
    openaiYamlSchema.parse(parsedYaml);
  } catch (error) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Invalid metadata at ${openaiYamlPath}`,
      `Check ${openaiYamlFilename} schema.`,
      error
    );
  }
  return manifest;
}

export function isKebabCase(value: string): boolean {
  return kebabCaseRegex.test(value);
}
