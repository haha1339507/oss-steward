# Security policy

## Supported versions

The latest `0.x` release on the default branch is supported.

## What this tool does

oss-steward is a local CLI / MCP server. It reads the filesystem and git metadata. `digest` can call the GitHub REST API with a token you provide. It does not store tokens and does not send repository contents to a third-party model.

## Reporting a vulnerability

Please **do not** open a public issue for security reports.

Email the maintainer through the GitHub security advisory form:

1. Open the repository on GitHub.
2. Choose **Security → Report a vulnerability**.
3. Include reproduction steps, impact, and whether a fix is already known.

You should receive an acknowledgement within 7 days. We will publish a fix or advisory before discussing the report in public.

## Token handling

- Prefer a fine-grained GitHub token with **read-only** `issues` and `pull requests` permissions.
- Do not commit `.env` files or tokens.
- Rotate any token that may have been exposed.
