# Use Case: MCP-Powered Workflow

Using MCP servers for live data access in AI-powered advertising workflows.

## Current Capabilities (Google Ads)

With the [google-ads-mcp](https://github.com/itallstartedwithaidea/google-ads-mcp) server:

```
You: "What's my top spending campaign this month?"
Claude: [calls google-ads-mcp → list_campaigns with date filter]
Claude: "Your top campaign is 'Brand - US' with $12,450 spend at a 4.2 ROAS."

You: "Pull the search term report for that campaign — show me wasted spend"
Claude: [calls google-ads-mcp → get_search_terms with cost > 0 and conversions = 0]
Claude: "Found 47 search terms with spend but zero conversions totaling $890..."
```

## Future Capabilities (Multi-Platform)

When MCP servers exist for Meta, Microsoft, Amazon, etc.:

```
You: "Compare my Google and Meta performance this month"
Claude: [calls google-ads-mcp → get_metrics]
Claude: [calls meta-ads-mcp → get_metrics]
Claude: [normalizes using core/models/metrics.py]
Claude: "Google: $15K spend, 150 conversions, $100 CPA. Meta: $8K spend, 120 conversions, $67 CPA."
```
