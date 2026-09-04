import { parseGitHubRepo, remoteUrl } from "./git.js";
import type { DigestItem, DigestReport, GitHubRepo } from "./types.js";

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  pull_request?: { url: string };
  labels: Array<string | { name?: string }>;
}

interface GitHubPull {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  draft?: boolean;
  labels: Array<string | { name?: string }>;
  requested_reviewers?: Array<{ login?: string }>;
  requested_teams?: Array<{ slug?: string }>;
}

export function resolveToken(explicit?: string): string | undefined {
  return explicit || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || undefined;
}

export function detectRepo(root: string): GitHubRepo | null {
  return parseGitHubRepo(remoteUrl(root));
}

function labelNames(labels: Array<string | { name?: string }> | undefined): string[] {
  if (!labels) {
    return [];
  }
  return labels
    .map((label) => (typeof label === "string" ? label : label.name ?? ""))
    .filter(Boolean);
}

function toItem(item: {
  number: number;
  title: string;
  html_url: string;
  updated_at: string;
  labels?: Array<string | { name?: string }>;
}): DigestItem {
  return {
    number: item.number,
    title: item.title,
    url: item.html_url,
    updatedAt: item.updated_at,
    labels: labelNames(item.labels),
  };
}

async function githubGet<T>(repo: GitHubRepo, path: string, token: string): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${repo.owner}/${repo.repo}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "oss-steward",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status} on ${path}: ${body.slice(0, 200)}`);
  }

  return (await response.json()) as T;
}

export async function runDigest(options: {
  root: string;
  staleDays: number;
  token?: string;
}): Promise<DigestReport> {
  const repo = detectRepo(options.root);
  const token = resolveToken(options.token);

  if (!repo) {
    return {
      repo: null,
      staleDays: options.staleDays,
      staleIssues: [],
      unlabeledIssues: [],
      waitingReview: [],
      notice: "No GitHub origin remote found. Digest stays empty without owner/repo.",
    };
  }

  if (!token) {
    return {
      repo: `${repo.owner}/${repo.repo}`,
      staleDays: options.staleDays,
      staleIssues: [],
      unlabeledIssues: [],
      waitingReview: [],
      notice:
        "No GITHUB_TOKEN or GH_TOKEN set. Digest is read-only GitHub metadata and will not invent issue data.",
    };
  }

  const [issues, pulls] = await Promise.all([
    githubGet<GitHubIssue[]>(repo, "/issues?state=open&per_page=100", token),
    githubGet<GitHubPull[]>(repo, "/pulls?state=open&per_page=100", token),
  ]);

  const cutoff = Date.now() - options.staleDays * 24 * 60 * 60 * 1000;
  const onlyIssues = issues.filter((issue) => !issue.pull_request);

  return {
    repo: `${repo.owner}/${repo.repo}`,
    staleDays: options.staleDays,
    staleIssues: onlyIssues
      .filter((issue) => Date.parse(issue.updated_at) < cutoff)
      .map(toItem),
    unlabeledIssues: onlyIssues.filter((issue) => labelNames(issue.labels).length === 0).map(toItem),
    waitingReview: pulls.filter((pull) => !pull.draft).map(toItem),
  };
}

export function formatDigest(report: DigestReport): string {
  const lines = [
    `oss-steward digest — ${report.repo ?? "unknown repo"}`,
    `Stale window: ${report.staleDays} days`,
    "",
  ];

  if (report.notice) {
    lines.push(report.notice);
    lines.push("");
  }

  const sections: Array<[string, DigestItem[]]> = [
    ["Stale issues", report.staleIssues],
    ["Unlabeled issues", report.unlabeledIssues],
    ["Open pull requests", report.waitingReview],
  ];

  for (const [title, items] of sections) {
    lines.push(`${title} (${items.length})`);
    if (items.length === 0) {
      lines.push("  none");
    } else {
      for (const item of items.slice(0, 20)) {
        lines.push(`  #${item.number}  ${item.title}  ${item.url}`);
      }
      if (items.length > 20) {
        lines.push(`  … ${items.length - 20} more`);
      }
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}
