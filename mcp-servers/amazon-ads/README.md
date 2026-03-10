# amazon-ads MCP Server

**Status:** 📋 Planned

## Proposed Tools

Based on the [MCP Server Spec](../SPEC.md):

- `list_campaigns` — List campaigns with status and metrics
- `get_campaign` — Detailed campaign data
- `get_metrics` — Performance metrics for date ranges
- `list_audiences` — Available audience segments
- `get_budget` — Budget and pacing status

## How to Build

1. Clone the [Python MCP template](../templates/python-mcp-template/)
2. Implement auth using `core/auth/amazon-ads.py`
3. Map platform API responses to `core/models/`
4. Test with Claude Code or Cursor
5. Submit a PR

## References

- Platform config: `platforms/amazon-ads/PLATFORM.yaml`
- Auth patterns: `platforms/amazon-ads/patterns/`
- Upstream repos: `platforms/amazon-ads/README.md`
