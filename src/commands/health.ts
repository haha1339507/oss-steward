import { ALL_CHECKS } from "../checks/index.js";
import { createRepoFs } from "../fs.js";
import type { HealthReport } from "../types.js";

export function runHealth(root: string): HealthReport {
  const fs = createRepoFs(root);
  const findings = ALL_CHECKS.map((check) => check(fs));

  return {
    root,
    findings,
    passed: findings.filter((item) => item.status === "pass").length,
    warned: findings.filter((item) => item.status === "warn").length,
    failed: findings.filter((item) => item.status === "fail").length,
    requiredFailed: findings.filter((item) => item.required && item.status === "fail").length,
  };
}

export function formatHealth(report: HealthReport): string {
  const lines = [
    `oss-steward health — ${report.root}`,
    "",
  ];

  for (const finding of report.findings) {
    const badge = finding.status.toUpperCase().padEnd(4);
    lines.push(`  ${badge}  ${finding.id.padEnd(18)} ${finding.detail}`);
  }

  lines.push("");
  lines.push(
    `Score: ${report.passed}/${report.findings.length} passed, ${report.warned} warning(s), ${report.failed} required failure(s)`,
  );

  if (report.requiredFailed > 0) {
    lines.push("Required maintainer files are missing. Fix those first.");
  }

  return lines.join("\n");
}
