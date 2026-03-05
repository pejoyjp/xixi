import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import { z } from "zod";
import { XixiError } from "./errors";
import { XixiSkillManifestV1 } from "./types";

const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const manifestSchema = z.object({
  schema_version: z.literal(1),
  name: z.string().regex(kebabCaseRegex, "name must be kebab-case"),
  dept: z.string().min(1),
  description: z.string().min(1),
  entry: z.string().min(1),
  version: z.string().min(1).optional()
});

export const manifestFilename = "xixi.yaml";

export async function loadManifest(skillRoot: string): Promise<XixiSkillManifestV1> {
  const manifestPath = path.join(skillRoot, manifestFilename);
  if (!(await fs.pathExists(manifestPath))) {
    throw new XixiError("MANIFEST_INVALID", `Missing manifest: ${manifestPath}`);
  }

  try {
    const raw = await fs.readFile(manifestPath, "utf8");
    const parsedYaml = yaml.load(raw);
    return manifestSchema.parse(parsedYaml);
  } catch (error) {
    throw new XixiError("MANIFEST_INVALID", `Invalid manifest at ${manifestPath}`, "Check xixi.yaml schema.", error);
  }
}

export async function loadAndValidateManifest(skillRoot: string, deptList: string[]): Promise<XixiSkillManifestV1> {
  const manifest = await loadManifest(skillRoot);
  if (!deptList.includes(manifest.dept)) {
    throw new XixiError(
      "MANIFEST_INVALID",
      `Manifest dept "${manifest.dept}" is not in allowed depts: ${deptList.join(", ")}`
    );
  }

  const entryPath = path.join(skillRoot, manifest.entry);
  if (!(await fs.pathExists(entryPath))) {
    throw new XixiError("MANIFEST_INVALID", `Entry file not found: ${manifest.entry}`, "Update manifest.entry or create file.");
  }
  return manifest;
}

export function isKebabCase(value: string): boolean {
  return kebabCaseRegex.test(value);
}

