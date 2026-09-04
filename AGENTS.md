# Agent instructions

This repository is a TypeScript CLI (`src/cli.ts`) plus a stdio MCP server (`src/mcp.ts`).

## Commands

- `npm test` — vitest
- `npm run typecheck` — `tsc --noEmit`
- `npm run build` — emit `dist/`
- `node dist/cli.js health` — dogfood the health report on this repo

## Constraints

- Keep tools **read-only**. Do not add GitHub write operations.
- Do not log secrets. Tokens come from `GITHUB_TOKEN` / `GH_TOKEN` only.
- When running as MCP, write diagnostics to **stderr** only.
- New health rules belong in `src/checks/index.ts` and need a test in `tests/health.test.ts`.
- Conventional commit parser lives in `src/commands/notes.ts`.

## Layout

- `src/cli.ts` — argument parsing and process exit codes
- `src/github.ts` — remote detection and GitHub REST reads
- `src/checks/` — filesystem/git health rules
- `tests/` — vitest cases, no network
