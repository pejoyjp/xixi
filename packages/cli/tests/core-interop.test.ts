import { describe, expect, it } from "vitest";
import { isKebabCase } from "@xixi/core";

describe("core interop", () => {
  it("uses core helpers from cli package", () => {
    expect(isKebabCase("good-name")).toBe(true);
    expect(isKebabCase("BadName")).toBe(false);
  });
});

