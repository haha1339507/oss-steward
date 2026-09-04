# Contributing

Thanks for helping improve oss-steward.

## Development setup

1. Install Node.js 20 or newer.
2. Clone this repository.
3. Run `npm install`.
4. Run `npm test` and `npm run typecheck` before opening a pull request.

## Project conventions

- Keep the CLI **read-only**. Do not add commands that comment, label, close, or merge on GitHub unless they are gated behind an explicit future `--write` flag and discussed in an issue first.
- Prefer deterministic checks over model calls. Optional AI features must degrade cleanly without a key.
- Add or update a vitest case for new health rules and commit parsers.
- Use conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.

## Pull requests

- Keep the change focused.
- Include the motivation and how you tested it.
- Update README / CHANGELOG when user-facing behavior changes.

## Reporting issues

Use the bug or feature issue templates. Please include the command you ran, Node version, and whether a GitHub token was set (never paste the token).
