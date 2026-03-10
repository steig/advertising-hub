#!/usr/bin/env bash
# Adds a "Part of The Advertising Hub" badge and section to your other repos.
# Run once: GITHUB_TOKEN=your_token ./scripts/add-backlinks.sh
#
# This creates PRs on your other repos (doesn't merge automatically).
set -euo pipefail

TOKEN="${GITHUB_TOKEN:?Set GITHUB_TOKEN environment variable}"

BACKLINK_SECTION='

---

## 🎯 Part of [The Advertising Hub](https://github.com/itallstartedwithaidea/advertising-hub)

This tool is part of the **Advertising Hub** — an open-source ecosystem connecting 14 advertising platforms with AI agents, MCP servers, and cross-platform automation.

[![Advertising Hub](https://img.shields.io/badge/Part_of-Advertising_Hub-blue)](https://github.com/itallstartedwithaidea/advertising-hub)
[![Platforms](https://img.shields.io/badge/Platforms-14-green)](https://github.com/itallstartedwithaidea/advertising-hub)

**Explore the ecosystem:**
- [All 14 platforms](https://github.com/itallstartedwithaidea/advertising-hub#-supported-platforms) — Google, Meta, Microsoft, Amazon, LinkedIn, Pinterest, Reddit, Spotify, TTD, Demandbase, Criteo, AdRoll, Quora
- [25+ AI agents](https://github.com/itallstartedwithaidea/advertising-hub#-the-agents) — Specialized agents for every advertising workflow
- [MCP Server Registry](https://github.com/itallstartedwithaidea/advertising-hub/tree/main/mcp-servers) — Build and find MCP servers for ad platforms
- [Cross-platform patterns](https://github.com/itallstartedwithaidea/advertising-hub/wiki) — Auth, tracking, audiences, reporting across platforms
'

echo "=== Backlink section to add to each repo's README ==="
echo ""
echo "Add this section to the bottom of README.md in each of these repos:"
echo ""
echo "  - itallstartedwithaidea/google-ads-mcp"
echo "  - itallstartedwithaidea/google-ads-api-agent"
echo "  - itallstartedwithaidea/google-ads-gemini-extension"
echo "  - itallstartedwithaidea/creative-asset-validator"
echo "  - itallstartedwithaidea/agency-agents-enhanced"
echo ""
echo "--- Section to append ---"
echo "$BACKLINK_SECTION"
echo "--- End section ---"
echo ""
echo "You can do this manually by editing each README, or use the GitHub API."
echo ""
echo "Quick manual method:"
echo "  1. Go to each repo on GitHub"
echo "  2. Click README.md → Edit (pencil icon)"
echo "  3. Paste the section above at the bottom"
echo "  4. Commit directly to main"
