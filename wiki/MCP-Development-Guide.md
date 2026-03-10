# MCP Development Guide

How to build MCP (Model Context Protocol) servers for advertising platforms.

## What Is MCP?

MCP is a protocol that lets AI tools (Claude, Cursor, Gemini) call external APIs through a standardized interface. An MCP server for Google Ads, for example, lets Claude pull live campaign data, run reports, and make changes — all within a conversation.

## Why Build Advertising MCP Servers?

Every platform has an API. But connecting an AI tool to that API requires:
1. Authentication handling
2. Request formatting
3. Response parsing
4. Error handling
5. Rate limiting

An MCP server wraps all of this into tools that AI can call naturally.

## Getting Started

1. **Choose a platform** — Check [mcp-servers/registry.yaml](../mcp-servers/registry.yaml) for what's available
2. **Start from a template** — [Python template](../mcp-servers/templates/python-mcp-template/) or [Node template](../mcp-servers/templates/node-mcp-template/)
3. **Implement the standard tools** — See [SPEC.md](../mcp-servers/SPEC.md)
4. **Use core/ for auth** — `core/auth/<platform>.py` handles credentials
5. **Test with Claude Code** — Add to your `claude_desktop_config.json`
6. **Submit a PR** — Add to the registry and share with the community

## Standard Tool Interface

Every advertising MCP server should implement at minimum:

- `list_campaigns` — List campaigns with status and metrics
- `get_campaign` — Detailed campaign data
- `get_metrics` — Performance metrics for date ranges
- `list_audiences` — Available audience segments
- `get_budget` — Budget and pacing status

See [SPEC.md](../mcp-servers/SPEC.md) for full specifications.

## Reference Implementation

The [google-ads-mcp](https://github.com/itallstartedwithaidea/google-ads-mcp) server is the reference implementation. Study its architecture for patterns you can apply to other platforms.
