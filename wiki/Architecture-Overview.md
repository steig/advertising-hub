# Architecture Overview

## How Everything Connects

```
                    ┌──────────────────────────────────────┐
                    │      itallstartedwithaidea.com        │
                    │      (Landing + Documentation)        │
                    └───────────────┬──────────────────────┘
                                    │
                    ┌───────────────▼──────────────────────┐
                    │    advertising-hub (this repo)        │
                    │    "The Industry One-Stop Shop"       │
                    └──┬──────┬──────┬──────┬──────┬──────┘
                       │      │      │      │      │
                  core/  agents/  platforms/  mcp/  wiki/
                       │      │      │      │      │
                       └──┬───┘      │      │      │
                          │          │      │      │
              ┌───────────▼──────────▼──────▼──────┘
              │         YOUR REPOS (submodules)
              │  google-ads-mcp · google-ads-api-agent
              │  google-ads-gemini-ext · creative-validator
              └──────────────────┬─────────────────
                                 │
              ┌──────────────────▼─────────────────┐
              │         googleadsagent.ai            │
              │   Simba · Nemo · Elsa · Baymax      │
              │              · Buddy                 │
              └────────────────────────────────────┘
```

## Design Principles

1. **Reference, don't fork** upstream platform repos — link to them, document them, don't maintain copies
2. **Core package** provides the shared plumbing — auth, models, rate limiting, errors
3. **Agents** are the interface layer — specialized AI personalities with platform knowledge
4. **MCP servers** are the API layer — giving AI tools direct data access
5. **Wiki** is the knowledge layer — practitioner documentation that doesn't exist elsewhere
6. **PLATFORM.yaml** makes everything machine-readable — agents and tools can consume this metadata
