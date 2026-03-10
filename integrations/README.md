# IDE & Tool Integrations

The Advertising Hub agents work with every major AI coding tool.

| Tool | Format | Install Location |
|------|--------|-----------------|
| [Claude Code](claude-code/) | `.md` (native) | `~/.claude/agents/` |
| [Cursor](cursor/) | `.mdc` rules | `.cursor/rules/` |
| [Gemini CLI](gemini-cli/) | `SKILL.md` extension | `~/.gemini/extensions/` |
| [Windsurf](windsurf/) | `.windsurfrules` | `./.windsurfrules` |
| [Aider](aider/) | `CONVENTIONS.md` | `./CONVENTIONS.md` |
| [OpenCode](opencode/) | `.md` agents | `.opencode/agent/` |

## Quick Install

```bash
./scripts/convert.sh    # Generate all integration files
./scripts/install.sh    # Interactive install (auto-detects your tools)
```

## Manual Install

```bash
# Claude Code (no conversion needed)
cp -r agents/ ~/.claude/agents/advertising-hub/

# Specific tool
./scripts/install.sh --tool cursor
./scripts/install.sh --tool gemini-cli
```
