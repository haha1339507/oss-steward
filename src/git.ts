import { execFileSync } from "node:child_process";
import type { GitHubRepo } from "./types.js";

export function git(root: string, args: string[]): string {
  return execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

export function isGitRepo(root: string): boolean {
  try {
    git(root, ["rev-parse", "--is-inside-work-tree"]);
    return true;
  } catch {
    return false;
  }
}

export function lastCommitUnix(root: string): number | null {
  try {
    const value = git(root, ["log", "-1", "--format=%ct"]);
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function recentCommitCount(root: string, sinceDays: number): number {
  try {
    const output = git(root, [
      "rev-list",
      "--count",
      `--since=${sinceDays} days ago`,
      "HEAD",
    ]);
    return Number(output) || 0;
  } catch {
    return 0;
  }
}

export function commitLog(
  root: string,
  options: { since?: string; max: number },
): { hash: string; subject: string; body: string }[] {
  const args = [
    "log",
    `--max-count=${options.max}`,
    "--pretty=format:%H%x1f%s%x1f%b%x1e",
    "--no-merges",
  ];
  if (options.since) {
    args.push(`${options.since}..HEAD`);
  }

  try {
    const output = git(root, args);
    if (!output) {
      return [];
    }
    return output
      .split("\x1e")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [hash = "", subject = "", body = ""] = chunk.split("\x1f");
        return { hash, subject: subject.trim(), body: body.trim() };
      });
  } catch {
    return [];
  }
}

export function remoteUrl(root: string): string | null {
  try {
    return git(root, ["remote", "get-url", "origin"]);
  } catch {
    return null;
  }
}

export function parseGitHubRepo(url: string | null | undefined): GitHubRepo | null {
  if (!url) {
    return null;
  }

  const cleaned = url.trim().replace(/\.git$/i, "");
  const patterns = [
    /^https?:\/\/github\.com\/([^/]+)\/([^/]+)$/i,
    /^git@github\.com:([^/]+)\/([^/]+)$/i,
    /^ssh:\/\/git@github\.com\/([^/]+)\/([^/]+)$/i,
    /^github\.com[:/]([^/]+)\/([^/]+)$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
  }

  return null;
}
