import { describe, expect, it } from "vitest";
import { runHealth } from "../src/commands/health.js";
import { tempDir, writeFiles } from "./helpers.js";

describe("runHealth", () => {
  it("fails required checks on an empty directory", () => {
    const root = tempDir();
    const report = runHealth(root);

    expect(report.requiredFailed).toBeGreaterThan(0);
    expect(report.findings.find((item) => item.id === "readme")?.status).toBe("fail");
    expect(report.findings.find((item) => item.id === "license")?.status).toBe("fail");
    expect(report.findings.find((item) => item.id === "ci")?.status).toBe("fail");
  });

  it("passes when maintainer files are present", () => {
    const root = tempDir();
    writeFiles(root, {
      "README.md": "# demo\n",
      LICENSE: "MIT\n",
      "SECURITY.md": "# Security\n",
      "CONTRIBUTING.md": "# Contributing\n",
      "CODE_OF_CONDUCT.md": "# Conduct\n",
      "CHANGELOG.md": "# Changelog\n",
      "AGENTS.md": "# Agents\n",
      ".github/workflows/ci.yml": "name: ci\n",
      ".github/ISSUE_TEMPLATE/bug.yml": "name: bug\n",
      ".github/PULL_REQUEST_TEMPLATE.md": "## PR\n",
      ".github/dependabot.yml": "version: 2\n",
    });

    const report = runHealth(root);
    const byId = Object.fromEntries(report.findings.map((item) => [item.id, item]));

    expect(byId.readme.status).toBe("pass");
    expect(byId.license.status).toBe("pass");
    expect(byId.security.status).toBe("pass");
    expect(byId.ci.status).toBe("pass");
    expect(byId.issue_templates.status).toBe("pass");
    expect(byId.pr_template.status).toBe("pass");
    expect(byId.dependabot.status).toBe("pass");
    expect(byId.agents.status).toBe("pass");
    expect(report.requiredFailed).toBe(0);
  });
});
