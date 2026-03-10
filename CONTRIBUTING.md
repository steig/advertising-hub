# Contributing to The Advertising Hub

Thank you for your interest in contributing! This project grows through the advertising community sharing hard-won knowledge about platform APIs, building tools, and writing documentation that helps everyone work smarter.

## Ways to Contribute

### 🔌 Build an MCP Server (High Impact)

Only Google Ads has a live MCP server today. Every other platform is an opportunity.

1. Pick a platform from the [MCP registry](mcp-servers/registry.yaml)
2. Start with our [Python template](mcp-servers/templates/python-mcp-template/) or [Node template](mcp-servers/templates/node-mcp-template/)
3. Follow the [MCP Development Guide](wiki/MCP-Development-Guide.md)
4. Submit a PR with your server + update the registry

### 🤖 Add or Improve an Agent

Agents live in `agents/` and follow a standard structure:

1. **Frontmatter**: name, description, tools, author
2. **Role Definition**: What this agent does and knows
3. **Core Capabilities**: Specific skills and expertise areas
4. **Tooling & Automation**: Which MCP servers and tools it uses
5. **Decision Framework**: When to use this agent
6. **Success Metrics**: How to measure if the agent helped

### 📝 Write a Pattern Doc

Pattern docs live in `platforms/<platform>/patterns/` and document real-world API knowledge:

- Authentication gotchas the official docs don't mention
- Rate limiting strategies that actually work at scale
- Cross-platform migration patterns
- Common error codes and their actual causes

### 📖 Improve the Wiki

The wiki in `wiki/` is mirrored to GitHub Wiki. Any improvements to cross-platform guides, platform deep-dives, or getting started docs are welcome.

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b add-meta-mcp-server`)
3. Make your changes
4. Run the linter if modifying agents: `./scripts/lint-agents.sh`
5. Submit a PR using our template

## Code of Conduct

Be helpful. Be honest. Share what you know. This project exists because the advertising industry needs better shared infrastructure for AI-powered automation.

## Questions?

Open an issue or start a discussion. We're here to help.
