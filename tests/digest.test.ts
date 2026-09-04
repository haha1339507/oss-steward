import { describe, expect, it } from "vitest";
import { formatDigest } from "../src/github.js";
import { parseGitHubRepo } from "../src/git.js";

describe("parseGitHubRepo", () => {
  it("parses https, ssh, and scp-style remotes", () => {
    expect(parseGitHubRepo("https://github.com/acme/oss-steward.git")).toEqual({
      owner: "acme",
      repo: "oss-steward",
    });
    expect(parseGitHubRepo("git@github.com:acme/oss-steward.git")).toEqual({
      owner: "acme",
      repo: "oss-steward",
    });
    expect(parseGitHubRepo("ssh://git@github.com/acme/oss-steward")).toEqual({
      owner: "acme",
      repo: "oss-steward",
    });
  });

  it("returns null for non-GitHub remotes", () => {
    expect(parseGitHubRepo("https://gitlab.com/acme/oss-steward.git")).toBeNull();
    expect(parseGitHubRepo(null)).toBeNull();
  });
});

describe("formatDigest", () => {
  it("prints the token notice instead of inventing issues", () => {
    const text = formatDigest({
      repo: "acme/oss-steward",
      staleDays: 21,
      staleIssues: [],
      unlabeledIssues: [],
      waitingReview: [],
      notice: "No GITHUB_TOKEN or GH_TOKEN set.",
    });

    expect(text).toContain("acme/oss-steward");
    expect(text).toContain("No GITHUB_TOKEN");
    expect(text).toContain("Stale issues (0)");
  });
});
