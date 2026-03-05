import { afterEach, describe, expect, it, vi } from "vitest";
import * as repoService from "../src/services/repo-service";
import { runRemote } from "../src/commands/remote";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("remote command", () => {
  it("prints json output", async () => {
    vi.spyOn(repoService, "listRemoteSkills").mockResolvedValue(["alpha-skill", "beta-skill"]);
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});

    await runRemote(
      {
        verbose: false,
        config: {
          skillsRepo: { url: "git@github.com:org/xixi-skills.git" }
        }
      },
      { json: true, name: "beta" }
    );

    expect(spy).toHaveBeenCalled();
    expect(String(spy.mock.calls[0][0])).toContain("beta-skill");
    expect(String(spy.mock.calls[0][0])).not.toContain("alpha-skill");
  });
});
