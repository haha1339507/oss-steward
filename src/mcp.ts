import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { resolve } from "node:path";
import { z } from "zod";
import { formatDigest, runDigest } from "./commands/digest.js";
import { formatHealth, runHealth } from "./commands/health.js";
import { formatNotes, runNotes } from "./commands/notes.js";
import { NAME, VERSION } from "./version.js";

function rootPath(root?: string): string {
  return resolve(root ?? process.cwd());
}

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: NAME,
    version: VERSION,
  });

  server.tool(
    "repo_health",
    "Read-only OSS maintainer health check for a local repository (license, CI, templates, recent commits).",
    {
      root: z.string().optional().describe("Absolute or relative repository path"),
    },
    async ({ root }) => {
      const report = runHealth(rootPath(root));
      return {
        content: [{ type: "text", text: formatHealth(report) }],
      };
    },
  );

  server.tool(
    "repo_digest",
    "Read-only GitHub digest of stale issues, unlabeled issues, and open pull requests. Requires GITHUB_TOKEN.",
    {
      root: z.string().optional().describe("Repository path used to detect origin"),
      stale_days: z.number().int().positive().optional().describe("Days before an issue is stale"),
    },
    async ({ root, stale_days }) => {
      const report = await runDigest({
        root: rootPath(root),
        staleDays: stale_days ?? 21,
      });
      return {
        content: [{ type: "text", text: formatDigest(report) }],
      };
    },
  );

  server.tool(
    "release_notes",
    "Read-only draft release notes from conventional git commits.",
    {
      root: z.string().optional().describe("Repository path"),
      since: z.string().optional().describe("Git ref or date to start from"),
      max: z.number().int().positive().optional().describe("Maximum commits to include"),
    },
    async ({ root, since, max }) => {
      const report = runNotes(rootPath(root), { since, max: max ?? 100 });
      return {
        content: [{ type: "text", text: formatNotes(report) }],
      };
    },
  );

  return server;
}

export async function startMcpServer(): Promise<void> {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${NAME} MCP server ${VERSION} listening on stdio (read-only tools)`);
}
