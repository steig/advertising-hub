# What Is MCP?

**Model Context Protocol (MCP)** is an open protocol that lets AI assistants connect to external tools and data sources. Think of it as a USB port for AI — a standard way to plug in capabilities.

## For Advertisers (Non-Technical)

Instead of copy-pasting data between your ad platforms and AI tools, MCP lets AI tools talk directly to your ad accounts. You can ask Claude "What's my Google Ads spend this month?" and it pulls live data.

## For Developers

MCP servers expose tools via a JSON-RPC interface. AI clients (Claude Desktop, Cursor, etc.) discover and call these tools. The server handles auth, API calls, and response formatting.

## Current State

- **Google Ads**: ✅ Live MCP server
- **All other platforms**: Specs and templates ready, servers need to be built

## Learn More

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCP Development Guide](../MCP-Development-Guide.md)
- [MCP Server Templates](../../mcp-servers/templates/)
