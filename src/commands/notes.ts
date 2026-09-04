import { commitLog } from "../git.js";
import type { CommitNote, NotesReport } from "../types.js";

const CONVENTIONAL =
  /^(?<type>feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(?<scope>\([^)]+\))?(?<bang>!)?:\s*(?<subject>.+)$/i;

const TYPE_HEADINGS: Record<string, string> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance",
  refactor: "Refactors",
  docs: "Documentation",
  test: "Tests",
  build: "Build",
  ci: "CI",
  chore: "Chores",
  revert: "Reverts",
  other: "Other",
};

export function parseCommit(hash: string, subject: string, body = ""): CommitNote {
  const match = subject.trim().match(CONVENTIONAL);
  const breaking = Boolean(match?.groups?.bang) || /BREAKING CHANGE/i.test(body);

  if (!match?.groups) {
    return {
      hash,
      type: "other",
      breaking,
      subject: subject.trim(),
      raw: subject.trim(),
    };
  }

  return {
    hash,
    type: match.groups.type.toLowerCase(),
    scope: match.groups.scope ? match.groups.scope.slice(1, -1) : undefined,
    breaking,
    subject: match.groups.subject.trim(),
    raw: subject.trim(),
  };
}

export function renderNotes(commits: CommitNote[], range: string): string {
  const groups = new Map<string, CommitNote[]>();
  for (const commit of commits) {
    const key = commit.type in TYPE_HEADINGS ? commit.type : "other";
    const list = groups.get(key) ?? [];
    list.push(commit);
    groups.set(key, list);
  }

  const lines = [`# Release notes`, "", `Range: ${range}`, ""];
  const breaking = commits.filter((commit) => commit.breaking);
  if (breaking.length > 0) {
    lines.push("## Breaking changes");
    for (const commit of breaking) {
      lines.push(`- ${commit.subject} (${commit.hash.slice(0, 7)})`);
    }
    lines.push("");
  }

  for (const type of Object.keys(TYPE_HEADINGS)) {
    const items = groups.get(type);
    if (!items?.length) {
      continue;
    }
    lines.push(`## ${TYPE_HEADINGS[type]}`);
    for (const commit of items) {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      lines.push(`- ${scope}${commit.subject} (${commit.hash.slice(0, 7)})`);
    }
    lines.push("");
  }

  if (commits.length === 0) {
    lines.push("No commits in this range.");
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

export function runNotes(root: string, options: { since?: string; max: number }): NotesReport {
  const range = options.since ? `${options.since}..HEAD` : `last ${options.max} commits`;
  const log = commitLog(root, options);
  const commits = log.map((entry) => parseCommit(entry.hash, entry.subject, entry.body));

  return {
    root,
    range,
    commits,
    markdown: renderNotes(commits, range),
  };
}

export function formatNotes(report: NotesReport): string {
  return report.markdown;
}
