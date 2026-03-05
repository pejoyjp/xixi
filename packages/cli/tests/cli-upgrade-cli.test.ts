import { afterEach, describe, expect, it, vi } from "vitest";
import { runUpgradeCli } from "../src/commands/upgrade-cli";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("upgrade-cli command", () => {
  it("runs npm install -g with default source", async () => {
    const runner = vi.fn().mockReturnValue({ status: 0 });

    await runUpgradeCli({}, { runner });

    expect(runner).toHaveBeenCalledWith(
      "npm",
      ["install", "-g", "git+https://github.com/pejoyjp/xixi.git"]
    );
  });

  it("throws when upgrade command fails", async () => {
    const runner = vi.fn().mockReturnValue({ status: 1 });

    await expect(runUpgradeCli({}, { runner })).rejects.toThrow();
  });
});
