import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readIndex, upsertIndexRecord } from "../src/index-store";

const homes: string[] = [];

function useTempHome(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "xixi-index-home-"));
  homes.push(dir);
  process.env.HOME = dir;
  process.env.USERPROFILE = dir;
  return dir;
}

afterEach(async () => {
  delete process.env.HOME;
  delete process.env.USERPROFILE;
  await Promise.all(homes.map((item) => fs.remove(item)));
  homes.length = 0;
});

describe("index-store", () => {
  it("writes and reads records", async () => {
    useTempHome();
    await upsertIndexRecord("engineering/pr-description", {
      dept: "engineering",
      name: "pr-description",
      description: "desc",
      installedPath: "/tmp/installed",
      source: {
        repo: "git@github.com:org/repo.git",
        ref: "abc123"
      }
    });

    const index = await readIndex();
    expect(index["engineering/pr-description"].source.ref).toBe("abc123");
  });

  it("throws on broken json", async () => {
    const home = useTempHome();
    const indexPath = path.join(home, ".xixi", "index.json");
    await fs.outputFile(indexPath, "{broken}");
    await expect(readIndex()).rejects.toThrow();
  });
});

