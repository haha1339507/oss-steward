export type CheckStatus = "pass" | "fail" | "warn";

export interface HealthFinding {
  id: string;
  title: string;
  status: CheckStatus;
  required: boolean;
  detail: string;
}

export interface HealthReport {
  root: string;
  findings: HealthFinding[];
  passed: number;
  warned: number;
  failed: number;
  requiredFailed: number;
}

export interface DigestItem {
  number: number;
  title: string;
  url: string;
  updatedAt: string;
  labels: string[];
}

export interface DigestReport {
  repo: string | null;
  staleDays: number;
  staleIssues: DigestItem[];
  unlabeledIssues: DigestItem[];
  waitingReview: DigestItem[];
  notice?: string;
}

export interface CommitNote {
  hash: string;
  type: string;
  scope?: string;
  breaking: boolean;
  subject: string;
  raw: string;
}

export interface NotesReport {
  root: string;
  range: string;
  commits: CommitNote[];
  markdown: string;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
}

export interface CliOptions {
  root: string;
  json: boolean;
  staleDays: number;
  since?: string;
  max: number;
}
