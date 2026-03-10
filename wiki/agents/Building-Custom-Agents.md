# Building Custom Agents

## Template

```markdown
---
name: Your Agent Name
description: One-line description of specialization
tools: WebFetch, WebSearch, Read, Write, Edit, Bash
author: Your Name
---

# Your Agent Name

## Role Definition
What this agent does and knows. Be specific about the domain.

## Core Capabilities
* Capability 1 — with detail
* Capability 2 — with detail

## Tooling & Automation
* Which MCP servers does this agent use?
* Which APIs does it reference?
* Link to relevant PLATFORM.yaml

## Decision Framework
When to use this agent vs another one.

## Success Metrics
How to measure if the agent is helping.
```

## Guidelines

1. **Be specific** — "PPC Campaign Strategist" not "Marketing Helper"
2. **Reference real tools** — Link to MCP servers, APIs, pattern docs
3. **Include success metrics** — Measurable outcomes, not vibes
4. **Test with real scenarios** — Run the agent through actual tasks before publishing
