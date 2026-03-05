import fs from "fs-extra";
import { XixiError } from "./errors";
import { getIndexPath } from "./paths";
import { InstalledSkillIndex, InstalledSkillRecord } from "./types";

export async function readIndex(): Promise<InstalledSkillIndex> {
  const indexPath = getIndexPath();
  if (!(await fs.pathExists(indexPath))) {
    return {};
  }
  try {
    const loaded = await fs.readJson(indexPath);
    return loaded as InstalledSkillIndex;
  } catch (error) {
    throw new XixiError("INDEX_IO_FAILED", `Failed to read index: ${indexPath}`, "Fix invalid JSON and rerun.", error);
  }
}

export async function writeIndex(index: InstalledSkillIndex): Promise<void> {
  const indexPath = getIndexPath();
  try {
    await fs.ensureFile(indexPath);
    await fs.writeJson(indexPath, index, { spaces: 2 });
  } catch (error) {
    throw new XixiError("INDEX_IO_FAILED", `Failed to write index: ${indexPath}`, undefined, error);
  }
}

export async function upsertIndexRecord(key: string, value: InstalledSkillRecord): Promise<void> {
  const index = await readIndex();
  index[key] = value;
  await writeIndex(index);
}

export async function removeIndexRecord(key: string): Promise<void> {
  const index = await readIndex();
  delete index[key];
  await writeIndex(index);
}

