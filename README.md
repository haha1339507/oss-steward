# oss-steward

Read-only CLI and MCP server for **small-team open-source maintainers**.

Humans and coding agents (Codex, Cursor, Claude Code, and others) can use the same commands to:

- check whether a repo looks maintained
- summarize stale / unlabeled issues and open pull requests
- draft release notes from conventional commits

No API key is required for `health` or `notes`. `digest` only talks to GitHub when `GITHUB_TOKEN` or `GH_TOKEN` is set, and it never invents issue data.

## Install

```bash
npm install -g oss-steward
# or
npx oss-steward help
```

Node.js 20+ is required.

## Commands

### `health`

Local filesystem + git checks. Works offline.

```bash
npx oss-steward health
npx oss-steward health --root ./my-repo --json
```

Example output:

```text
oss-steward health — /path/to/repo

  PASS  readme             README.md present
  PASS  license            LICENSE present
  PASS  ci                 2 workflow(s): ci.yml, health.yml
  WARN  security           SECURITY.md missing

Score: 10/12 passed, 2 warning(s), 0 required failure(s)
```

Required checks: `readme`, `license`, `ci`. Missing required files exit with code 1.

### `digest`

Read-only GitHub metadata. Detects `owner/repo` from `origin`.

```bash
export GITHUB_TOKEN=ghp_your_token
npx oss-steward digest --stale-days 21
```

Without a token, oss-steward prints a clear notice and an empty digest.

### `notes`

```bash
npx oss-steward notes
npx oss-steward notes --since v0.1.0 --max 100
```

Parses conventional commits (`feat:`, `fix(scope):`, `feat!:`) and writes Markdown release notes.

### `mcp`

Exposes the same three commands as **read-only** MCP tools:

| Tool | What it does |
| --- | --- |
| `repo_health` | Maintainer-readiness report |
| `repo_digest` | Stale / unlabeled issues and open PRs |
| `release_notes` | Conventional-commit changelog draft |

Cursor / Claude Code / Codex example:

```json
{
  "mcpServers": {
    "oss-steward": {
      "command": "npx",
      "args": ["-y", "oss-steward", "mcp"],
      "env": {
        "GITHUB_TOKEN": "optional-for-digest"
      }
    }
  }
}
```

Logs go to stderr. stdout is reserved for MCP JSON-RPC.

## GitHub Action

This repository ships a composite action that dogfoods the CLI:

```yaml
- uses: haha1339507/oss-steward@v0.1.0
  with:
    command: health
```

Inputs: `command` (`health` | `digest` | `notes`), `root`, `token`.

## Design rules

- Default is read-only. The CLI never opens issues, comments, or merges.
- No OpenAI / LLM call is required to get a useful result.
- Missing GitHub credentials produce a notice, not fake metrics.

## Development

```bash
npm install
npm test
npm run typecheck
npm run build
node dist/cli.js health
```

## License

MIT
