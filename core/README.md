# Core Package

Shared utilities for working with advertising platform APIs across all 14 supported platforms.

## Modules

| Module | Purpose |
|--------|---------|
| `auth/` | Unified OAuth2/API key authentication for every platform |
| `models/` | Normalized data models (campaigns, ads, audiences, metrics) |
| `rate_limiting/` | Platform-specific adaptive rate limiting |
| `errors/` | Unified error taxonomy across platforms |
| `utils/` | Currency, date ranges, pagination, response normalization |

## Design Principles

1. **Platform-agnostic interfaces** — Write code once, target any platform
2. **Normalized models** — A campaign is a campaign regardless of platform naming
3. **Fail gracefully** — Platform APIs go down, rate limits hit, tokens expire — core handles it
4. **AI-native** — Designed for consumption by AI agents and MCP servers

## Quick Start

```python
from core.auth.google import GoogleAdsAuth
from core.models.campaign import Campaign

google = GoogleAdsAuth(client_id="...", client_secret="...", refresh_token="...")
campaign = Campaign(platform="google-ads", name="Brand - US", budget_daily=500.00)
```
