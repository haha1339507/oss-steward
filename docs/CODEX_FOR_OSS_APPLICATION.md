# Codex for Open Source application

Official form: https://openai.com/form/codex-for-oss/

Fill this after the GitHub profile and repository are **public**. Numbers below are the honest values at first publish. Update stars / downloads before you submit if they changed.

## Account checklist

- ChatGPT account email (same inbox OpenAI will reply to)
- GitHub username is public: `haha1339507`
- Repository is public: https://github.com/haha1339507/oss-steward
- Role: **Primary maintainer**
- OpenAI Organization ID from https://platform.openai.com/settings/organization/general (`org_...`)

## Form fields

**GitHub username**

```text
haha1339507
```

**GitHub repository URL**

```text
https://github.com/haha1339507/oss-steward
```

**Describe your role**

```text
Primary maintainer
```

**Why does this repository qualify? (max 500 characters)**

```text
oss-steward is an open-source CLI + MCP server for solo/small-team maintainers. It runs local health checks (license, CI, templates, recent commits), a read-only GitHub digest of stale/unlabeled issues and open PRs, and conventional-commit release notes. Humans and coding agents share the same read-only tools; health/notes need no API key. I am the author and primary maintainer (releases, CI, issues). Stars: 0. npm downloads: 0. It targets rising maintainer load from agent-authored contributions.
```

Character count: keep this block under 500 characters. If you add later metrics, replace the two zeros instead of adding adjectives.

**I’m interested in...**

- [x] API credits for my project
- [ ] Codex Security (optional; only if you later add security-sensitive workflows)

**How will you use API credits for your project? (max 500 characters)**

```text
Use credits in CI on fixture repos: generate health explanations for large trees, optionally classify digest items (stale vs needs-human vs first-good-issue), and regression-test MCP tools (repo_health, repo_digest, release_notes) against real GitHub metadata. Credits stay on maintainer automation — review notes, release-draft checks, agent-instruction freshness — not general chat. Write actions stay disabled unless a future flagged command is discussed first.
```

**Anything else we should know? (max 500 characters)**

```text
Default mode is read-only: the CLI never comments, labels, or merges. I dogfood oss-steward on this repository (GitHub Action + `oss-steward health` in CI). If accepted, I will keep weekly maintenance (issues, Dependabot, releases) and publish npm so download counts become a real usage signal. This is not a request for a personal ChatGPT subscription; it is support for maintaining a public maintainer-tools + MCP project.
```

## Do not write

- That the repo was created to obtain Pro
- Student / personal-hardship language
- Inflated stars, downloads, or fake users
