# MCP Server Registry

MCP (Model Context Protocol) servers give AI tools like Claude, Cursor, and Gemini direct access to advertising platform APIs.

## Live Servers

| Platform | Repo | Status |
|----------|------|--------|
| Google Ads | [google-ads-mcp](https://github.com/itallstartedwithaidea/google-ads-mcp) | ✅ Live |

## Spec Ready (Architecture Documented)

| Platform | Build Guide | Priority |
|----------|------------|----------|
| Meta Ads | [meta-ads/](meta-ads/) | High |
| Microsoft Ads | [microsoft-ads/](microsoft-ads/) | High |
| Amazon Ads | [amazon-ads/](amazon-ads/) | High |
| LinkedIn Ads | [linkedin-ads/](linkedin-ads/) | Medium |
| The Trade Desk | [thetradedesk/](thetradedesk/) | Medium |

## Building a New MCP Server

1. Start with a [template](templates/)
2. Read the [MCP Development Guide](../wiki/MCP-Development-Guide.md)
3. Follow the standard tool interface in [SPEC.md](SPEC.md)
4. Submit a PR to add it to the registry

## Standard Tool Interface

Every advertising MCP server should implement these core tools:

```
list_campaigns      → List campaigns with status and basic metrics
get_campaign        → Get detailed campaign data by ID
list_ad_groups      → List ad groups within a campaign
get_metrics         → Pull performance metrics for a date range
search_terms        → Search term report (search platforms only)
list_audiences      → List available audiences
get_budget          → Current budget and pacing status
```

Platform-specific tools extend beyond this baseline.
