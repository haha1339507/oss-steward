import { describe, expect, it } from "vitest";
import { parseCommit, renderNotes } from "../src/commands/notes.js";

describe("parseCommit", () => {
  it("parses conventional commits with scope and breaking marker", () => {
    const note = parseCommit("abc1234deadbeef", "feat(cli)!: add digest command", "BREAKING CHANGE: output shape");

    expect(note.type).toBe("feat");
    expect(note.scope).toBe("cli");
    expect(note.breaking).toBe(true);
    expect(note.subject).toBe("add digest command");
  });

  it("falls back to other for free-form subjects", () => {
    const note = parseCommit("def", "tweaked readme wording");
    expect(note.type).toBe("other");
    expect(note.subject).toBe("tweaked readme wording");
  });
});

describe("renderNotes", () => {
  it("groups commits and lists breaking changes first", () => {
    const markdown = renderNotes(
      [
        parseCommit("1111111", "feat: add health command"),
        parseCommit("2222222", "fix(github): handle missing token"),
        parseCommit("3333333", "feat!: rename binary", "BREAKING CHANGE: bin name"),
      ],
      "v0.1.0..HEAD",
    );

    expect(markdown).toContain("## Breaking changes");
    expect(markdown).toContain("## Features");
    expect(markdown).toContain("## Bug Fixes");
    expect(markdown).toContain("**github:** handle missing token");
    expect(markdown).toContain("Range: v0.1.0..HEAD");
  });
});
