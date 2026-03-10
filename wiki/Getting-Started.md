# Getting Started

## For Advertisers: Use the Agents

The fastest way to start is copying agents into your AI coding tool:

### Claude Code (Recommended)

```bash
git clone https://github.com/itallstartedwithaidea/advertising-hub.git
cp -r advertising-hub/agents/ ~/.claude/agents/advertising-hub/
```

Then in Claude Code:
```
Use the PPC Campaign Strategist agent to help me restructure this Google Ads account.
```

### Cursor, Gemini CLI, Windsurf, Aider, OpenCode

```bash
cd advertising-hub
./scripts/convert.sh    # Generate integration files
./scripts/install.sh    # Interactive install
```

## For Developers: Use the Core Package

```bash
pip install -e ./core[google,meta]
```

```python
from core.auth.google import GoogleAdsAuth
from core.auth.meta import MetaAdsAuth
from core.models.campaign import Campaign

# Unified auth
google = GoogleAdsAuth(
    client_id="your_client_id",
    client_secret="your_client_secret",
    refresh_token="your_refresh_token",
    developer_token="your_dev_token"
)
token = google.authenticate()
```

## For Tool Builders: Build an MCP Server

1. Browse [mcp-servers/](../mcp-servers/) — pick a platform
2. Start with a [template](../mcp-servers/templates/)
3. Follow the [[MCP Development Guide]]
4. Use `core/auth/` for authentication
5. Submit a PR

## Platform Login URLs

Quick reference for all platform dashboards:

| Platform | Login URL |
|----------|----------|
| Google Ads | [ads.google.com](https://ads.google.com) |
| Meta Business | [business.facebook.com](https://business.facebook.com) |
| Microsoft Ads | [ads.microsoft.com](https://ads.microsoft.com) |
| Amazon Ads | [advertising.amazon.com](https://advertising.amazon.com) |
| LinkedIn Campaign Manager | [linkedin.com/campaignmanager](https://www.linkedin.com/campaignmanager) |
| Pinterest Ads | [ads.pinterest.com](https://ads.pinterest.com) |
| Reddit Ads | [ads.reddit.com](https://ads.reddit.com) |
| Spotify Ad Studio | [ads.spotify.com](https://ads.spotify.com) |
| The Trade Desk | [desk.thetradedesk.com](https://desk.thetradedesk.com) |
| Demandbase | [demandbase.com](https://www.demandbase.com) |
| Criteo | [marketing.criteo.com](https://marketing.criteo.com) |
| AdRoll | [app.adroll.com](https://app.adroll.com) |
| Quora Ads | [quora.com/ads](https://www.quora.com/ads) |
