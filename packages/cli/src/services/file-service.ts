import fs from "fs-extra";

export async function ensureAbsent(targetPath: string): Promise<boolean> {
  return !(await fs.pathExists(targetPath));
}

export async function copyDir(sourcePath: string, targetPath: string): Promise<void> {
  await fs.copy(sourcePath, targetPath, {
    overwrite: true,
    recursive: true,
    filter: (src) => !src.includes(`${process.platform === "win32" ? "\\" : "/"}node_modules${process.platform === "win32" ? "\\" : "/"}`)
  });
}

