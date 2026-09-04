#!/usr/bin/env node
import { resolve } from "node:path";
import { formatDigest, runDigest } from "./commands/digest.js";
import { formatHealth, runHealth } from "./commands/health.js";
import { formatNotes, runNotes } from "./commands/notes.js";
import { startMcpServer } from "./mcp.js";
import type { CliOptions } from "./types.js";
import { NAME, VERSION } from "./version.js";

const USAGE = `Usage: ${NAME} <command> [options]

Commands:
  health    Check maintainer-readiness files and recent activity
  digest    Summarize stale/unlabeled issues and open pull requests
  notes     Draft release notes from conventional commits
  mcp       Start a read-only MCP server on stdio
  version   Print version
  help      Show this message

Options:
  --root <path>        Repository root (default: current directory)
  --json               Machine-readable output
  --stale-days <n>     Digest stale window in days (default: 21)
  --since <ref>        Notes range start (tag, commit, or date)
  --max <n>            Max commits for notes (default: 100)
`;

function fail(message: string, code = 1): never {
  process.stderr.write(`${message}\n`);
  process.exit(code);
}

function readFlag(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    fail(`${name} requires a value`);
  }
  return value;
}

function parseOptions(args: string[]): CliOptions {
  const staleRaw = readFlag(args, "--stale-days");
  const maxRaw = readFlag(args, "--max");
  const staleDays = staleRaw ? Number(staleRaw) : 21;
  const max = maxRaw ? Number(maxRaw) : 100;

  if (!Number.isFinite(staleDays) || staleDays <= 0) {
    fail("--stale-days must be a positive number");
  }
  if (!Number.isFinite(max) || max <= 0) {
    fail("--max must be a positive number");
  }

  return {
    root: resolve(readFlag(args, "--root") ?? process.cwd()),
    json: args.includes("--json"),
    staleDays,
    since: readFlag(args, "--since"),
    max,
  };
}

function print(payload: unknown, text: string, asJson: boolean): void {
  process.stdout.write(`${asJson ? JSON.stringify(payload, null, 2) : text}\n`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const command = argv[0] ?? "help";
  const options = parseOptions(argv.slice(1));

  switch (command) {
    case "help":
    case "--help":
    case "-h":
      process.stdout.write(USAGE);
      return;
    case "version":
    case "--version":
    case "-v":
      process.stdout.write(`${VERSION}\n`);
      return;
    case "health": {
      const report = runHealth(options.root);
      print(report, formatHealth(report), options.json);
      process.exitCode = report.requiredFailed > 0 ? 1 : 0;
      return;
    }
    case "digest": {
      const report = await runDigest({
        root: options.root,
        staleDays: options.staleDays,
      });
      print(report, formatDigest(report), options.json);
      return;
    }
    case "notes": {
      const report = runNotes(options.root, { since: options.since, max: options.max });
      print(report, formatNotes(report), options.json);
      return;
    }
    case "mcp":
      await startMcpServer();
      return;
    default:
      fail(`Unknown command: ${command}\n\n${USAGE}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  fail(message);
});
