import fs from "fs-extra";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { runView } from "../src/commands/view";

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.HOME;
  delete process.env.USERPROFILE;
});

describe("view command", () => {
  it("prints json output", async () => {
    const home = await fs.mkdtemp(path.join(os.tmpdir(), "xixi-view-home-"));
    process.env.HOME = home;
    process.env.USERPROFILE = home;
    await fs.outputJson(path.join(home, ".xixi", "index.json"), {
      "engineering/pr-description": {
        dept: "engineering",
        name: "pr-description",
        description: "Generate PR description",
        installedPath: "/tmp/skill",
        source: { repo: "git@github.com:org/repo.git", ref: "abc" }
      }
    });

    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    await runView({ json: true });
    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0][0])).toContain("engineering/pr-description");
    await fs.remove(home);
  });
});
