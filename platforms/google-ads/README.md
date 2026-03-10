# Google Ads

> The largest search advertising platform. $200B+ annual revenue. The only platform in this hub with a live MCP server.

## Quick Links

| Resource | Link |
|----------|------|
| Platform Login | [ads.google.com](https://ads.google.com) |
| API Documentation | [developers.google.com](https://developers.google.com/google-ads/api/docs/start) |
| Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) |
| API Version | v18 |
| Auth Type | OAuth2 |

## Our Tools (Live)

- **[google-ads-mcp](https://github.com/itallstartedwithaidea/google-ads-mcp)** — MCP server giving Claude direct read/write access to Google Ads accounts
- **[google-ads-api-agent](https://github.com/itallstartedwithaidea/google-ads-api-agent)** — Enterprise Google Ads management agent on Claude Opus
- **[google-ads-gemini-extension](https://github.com/itallstartedwithaidea/google-ads-gemini-extension)** — Gemini CLI extension for Google Ads management

## Official Upstream Repos

| Repo | Language | Purpose |
|------|----------|---------|
| [googleads/google-ads-python](https://github.com/googleads/google-ads-python) | Python | Primary client library |
| [googleads/google-ads-node](https://github.com/googleads/google-ads-node) | Node.js | JavaScript/TypeScript client |
| [googleads/google-ads-dotnet](https://github.com/googleads/google-ads-dotnet) | C# | .NET client |
| [googleads/google-ads-java](https://github.com/googleads/google-ads-java) | Java | Java client |
| [googleads/google-ads-php](https://github.com/googleads/google-ads-php) | PHP | PHP client |
| [googleads/google-ads-ruby](https://github.com/googleads/google-ads-ruby) | Ruby | Ruby client |
| [googleads/googleads-shopping-samples](https://github.com/googleads/googleads-shopping-samples) | Multi | Shopping campaign samples |

**Not included:** Mobile SDK repos (googleads-mobile-*), deprecated SOAP libraries (googleads-python-lib), Ad Manager repos — these aren't relevant to paid media management.

## Agents

- [PPC Campaign Strategist](agents/ppc-strategist.md) — Account architecture, bidding, budgets
- [Search Query Analyst](agents/search-query-analyst.md) — Search term mining, negative keywords
- [Paid Media Auditor](agents/auditor.md) — 200+ point account audits
- [Ad Creative Strategist](agents/creative-strategist.md) — RSA copy, PMax assets

## Patterns

- [GAQL Query Patterns](patterns/gaql-query-patterns.md) — Essential queries for every advertiser
- [Enhanced Conversions](patterns/enhanced-conversions.md) — Setup and gotchas
- [Performance Max Asset Groups](patterns/pmax-asset-groups.md) — Architecture guide
- [Conversion Actions](patterns/conversion-actions.md) — Primary vs secondary, hierarchy design
- [API Version Migration](patterns/api-version-migration.md) — Staying current

## Auth Setup

See [core/auth/google.py](../../core/auth/google.py) and the [Authentication Patterns](../../wiki/cross-platform/Authentication-Patterns.md) wiki page.
