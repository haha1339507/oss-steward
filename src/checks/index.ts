import { firstExisting, type RepoFs } from "../fs.js";
import { isGitRepo, lastCommitUnix, recentCommitCount } from "../git.js";
import type { HealthFinding } from "../types.js";

const NINETY_DAYS = 90;
const NINETY_SECONDS = NINETY_DAYS * 24 * 60 * 60;

export type CheckFn = (fs: RepoFs) => HealthFinding;

function finding(
  id: string,
  title: string,
  required: boolean,
  ok: boolean,
  detail: string,
  warnOnly = false,
): HealthFinding {
  return {
    id,
    title,
    required,
    status: ok ? "pass" : warnOnly ? "warn" : "fail",
    detail,
  };
}

export const readmeCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["README.md", "README.MD", "readme.md"]);
  return finding("readme", "README", true, Boolean(path), path ? `${path} present` : "README.md missing");
};

export const licenseCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["LICENSE", "LICENSE.md", "LICENSE.txt", "COPYING"]);
  return finding("license", "License", true, Boolean(path), path ? `${path} present` : "LICENSE missing");
};

export const securityCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["SECURITY.md", ".github/SECURITY.md"]);
  return finding(
    "security",
    "Security policy",
    false,
    Boolean(path),
    path ? `${path} present` : "SECURITY.md missing",
    true,
  );
};

export const contributingCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["CONTRIBUTING.md", ".github/CONTRIBUTING.md"]);
  return finding(
    "contributing",
    "Contributing guide",
    false,
    Boolean(path),
    path ? `${path} present` : "CONTRIBUTING.md missing",
    true,
  );
};

export const codeOfConductCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["CODE_OF_CONDUCT.md", ".github/CODE_OF_CONDUCT.md"]);
  return finding(
    "code_of_conduct",
    "Code of conduct",
    false,
    Boolean(path),
    path ? `${path} present` : "CODE_OF_CONDUCT.md missing",
    true,
  );
};

export const changelogCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["CHANGELOG.md", "CHANGES.md", "HISTORY.md"]);
  return finding(
    "changelog",
    "Changelog",
    false,
    Boolean(path),
    path ? `${path} present` : "CHANGELOG.md missing",
    true,
  );
};

export const ciCheck: CheckFn = (fs) => {
  const files = fs
    .list(".github/workflows")
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"));
  return finding(
    "ci",
    "GitHub Actions CI",
    true,
    files.length > 0,
    files.length > 0 ? `${files.length} workflow(s): ${files.join(", ")}` : "no files in .github/workflows",
  );
};

export const issueTemplateCheck: CheckFn = (fs) => {
  const files = fs.list(".github/ISSUE_TEMPLATE");
  const single = firstExisting(fs, [
    ".github/ISSUE_TEMPLATE.md",
    "ISSUE_TEMPLATE.md",
    ".github/ISSUE_TEMPLATE/config.yml",
    ".github/ISSUE_TEMPLATE/config.yaml",
  ]);
  const ok = files.length > 0 || Boolean(single);
  return finding(
    "issue_templates",
    "Issue templates",
    false,
    ok,
    ok ? "issue templates present" : "no .github/ISSUE_TEMPLATE files",
    true,
  );
};

export const prTemplateCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, [
    ".github/PULL_REQUEST_TEMPLATE.md",
    ".github/pull_request_template.md",
    "PULL_REQUEST_TEMPLATE.md",
    ".github/PULL_REQUEST_TEMPLATE/pull_request_template.md",
  ]);
  return finding(
    "pr_template",
    "Pull request template",
    false,
    Boolean(path),
    path ? `${path} present` : "PR template missing",
    true,
  );
};

export const dependabotCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, [".github/dependabot.yml", ".github/dependabot.yaml"]);
  return finding(
    "dependabot",
    "Dependabot",
    false,
    Boolean(path),
    path ? `${path} present` : "Dependabot config missing",
    true,
  );
};

export const agentsCheck: CheckFn = (fs) => {
  const path = firstExisting(fs, ["AGENTS.md", "agents.md"]);
  return finding(
    "agents",
    "Agent instructions",
    false,
    Boolean(path),
    path ? `${path} present` : "AGENTS.md missing (useful for coding agents)",
    true,
  );
};

export const recentCommitsCheck: CheckFn = (fs) => {
  if (!isGitRepo(fs.root)) {
    return finding("recent_commits", "Recent commits", false, false, "not a git repository", true);
  }

  const last = lastCommitUnix(fs.root);
  const count = recentCommitCount(fs.root, NINETY_DAYS);
  const now = Math.floor(Date.now() / 1000);
  const fresh = last !== null && now - last <= NINETY_SECONDS;
  const detail =
    last === null
      ? "no commits found"
      : `${count} commit(s) in the last ${NINETY_DAYS} days; last commit ${Math.floor((now - last) / 86400)} day(s) ago`;

  return finding("recent_commits", "Recent commits", false, fresh && count > 0, detail, true);
};

export const ALL_CHECKS: CheckFn[] = [
  readmeCheck,
  licenseCheck,
  securityCheck,
  contributingCheck,
  codeOfConductCheck,
  changelogCheck,
  ciCheck,
  issueTemplateCheck,
  prTemplateCheck,
  dependabotCheck,
  agentsCheck,
  recentCommitsCheck,
];
