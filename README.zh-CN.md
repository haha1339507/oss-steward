# oss-steward

给**个人 / 小团队开源维护者**用的只读 CLI 和 MCP 服务。

人和 coding agent（Codex、Cursor、Claude Code 等）可以用同一套命令：

- 检查仓库是否具备维护者该有的文件和活跃度
- 汇总过期 / 未标记 Issue 和待处理 PR
- 从 conventional commits 起草 Release Notes

`health` 和 `notes` 不需要 API Key。`digest` 只有在设置了 `GITHUB_TOKEN` 或 `GH_TOKEN` 时才会请求 GitHub，并且不会编造 Issue 数据。

## 安装

```bash
npm install -g oss-steward
# 或
npx oss-steward help
```

需要 Node.js 20+。

## 命令

### `health`

本地文件和 git 检查，可离线使用。

```bash
npx oss-steward health
npx oss-steward health --root ./my-repo --json
```

必检项：`readme`、`license`、`ci`。必检失败时退出码为 1。

### `digest`

只读 GitHub 元数据，从 `origin` 识别 `owner/repo`。

```bash
export GITHUB_TOKEN=ghp_your_token
npx oss-steward digest --stale-days 21
```

没有 token 时会明确提示，并返回空摘要。

### `notes`

```bash
npx oss-steward notes
npx oss-steward notes --since v0.1.0
```

### `mcp`

把上述三条命令暴露成只读 MCP 工具：`repo_health`、`repo_digest`、`release_notes`。

## 设计约束

- 默认只读，不会创建 Issue、评论或合并 PR
- 不依赖大模型也能给出有用结果
- 缺少 GitHub 凭证时给出说明，而不是假数据

## 许可证

MIT
