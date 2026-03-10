# Advertising Hub Agents

25+ specialized AI agents for advertising automation. Each agent is a markdown file containing identity, capabilities, workflows, and success metrics that can be loaded into Claude Code, Cursor, Gemini CLI, and other AI coding tools.

## Agent Categories

### Paid Media Division (7 agents)
Battle-tested agents from [The Agency Enhanced](https://github.com/itallstartedwithaidea/agency-agents-enhanced), backed by production tooling from [googleadsagent.ai](https://googleadsagent.ai).

### Platform Specialists (9 agents)
Deep expertise in a single platform's unique features, API patterns, and optimization strategies.

### Cross-Platform Agents (5 agents)
Coordinate across multiple platforms for budget allocation, attribution, audience strategy, competitive intel, and unified reporting.

### Orchestrator (1 agent)
Buddy — the meta-agent that routes to the right specialist and coordinates multi-platform workflows.

## Agent Template

Every agent follows this structure:

```yaml
---
name: Agent Name
description: One-line description
tools: WebFetch, WebSearch, Read, Write, Edit, Bash
author: Author Name
---
```

1. **Role Definition** — What the agent does and knows
2. **Core Capabilities** — Specific skills
3. **Tooling & Automation** — MCP servers and tools it uses
4. **Decision Framework** — When to use this agent
5. **Success Metrics** — Measurable outcomes

## Installation

```bash
# Claude Code
cp -r agents/ ~/.claude/agents/advertising-hub/

# Other tools
./scripts/convert.sh
./scripts/install.sh
```
