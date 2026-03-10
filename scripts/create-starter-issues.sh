#!/usr/bin/env bash
# Creates starter issues for contributor onboarding
# Run once after repo setup: GITHUB_TOKEN=your_token ./scripts/create-starter-issues.sh
set -euo pipefail

REPO="itallstartedwithaidea/advertising-hub"
TOKEN="${GITHUB_TOKEN:?Set GITHUB_TOKEN environment variable}"

create_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  curl -s -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/issues" \
    -d "$(jq -n --arg t "$title" --arg b "$body" --argjson l "$labels" '{title: $t, body: $b, labels: $l}')" \
    | jq -r '.number'
}

echo "Creating starter issues..."

# Good First Issues - MCP Servers
for platform in "Meta Ads" "Microsoft Ads" "Amazon Ads" "LinkedIn Ads" "Pinterest Ads"; do
  slug=$(echo "$platform" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  NUM=$(create_issue \
    "Build MCP Server: $platform" \
    "## Goal\n\nBuild an MCP server for **$platform** so AI tools (Claude, Cursor, Gemini) can interact with the ${platform} API directly.\n\n## Getting Started\n\n1. Start with the [Python MCP template](mcp-servers/templates/python-mcp-template/)\n2. Review the [MCP Server Spec](mcp-servers/SPEC.md) for required tools\n3. Use \`core/auth/${slug}.py\` for authentication\n4. Reference \`platforms/${slug}/PLATFORM.yaml\` for API details\n5. See the [MCP Development Guide](wiki/MCP-Development-Guide.md)\n\n## Reference Implementation\n\nThe [google-ads-mcp](https://github.com/itallstartedwithaidea/google-ads-mcp) server is the reference implementation.\n\n## Minimum Viable Tools\n\n- \`list_campaigns\`\n- \`get_metrics\`\n- \`list_audiences\`" \
    '["good first issue", "mcp-server", "help wanted"]')
  echo "  Created #$NUM: Build MCP Server: $platform"
done

# Good First Issues - Pattern Docs
for triple in "Microsoft Ads:import-from-google:Document the Google-to-Microsoft import workflow, what transfers cleanly, and what needs manual adjustment" \
  "Amazon Ads:sponsored-products-architecture:Document Sponsored Products campaign structure best practices including auto-to-manual keyword harvesting" \
  "LinkedIn Ads:lead-gen-form-best-practices:Document LinkedIn Lead Gen Form optimization including field selection, CRM integration, and quality scoring" \
  "The Trade Desk:kokai-bidding-guide:Document Kokai AI bidding strategies, when to use each optimization goal, and how to interpret performance"; do

  platform=$(echo "$triple" | cut -d: -f1)
  pattern=$(echo "$triple" | cut -d: -f2)
  desc=$(echo "$triple" | cut -d: -f3)
  slug=$(echo "$platform" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')

  NUM=$(create_issue \
    "Pattern Doc: $platform — $pattern" \
    "## Goal\n\nWrite a practitioner pattern doc for \`platforms/${slug}/patterns/${pattern}.md\`.\n\n## What to Cover\n\n${desc}\n\n## Template\n\nSee existing patterns in \`platforms/google-ads/patterns/\` for the style and depth expected. Patterns should cover real API gotchas and practitioner knowledge that official docs don't include." \
    '["good first issue", "documentation", "patterns", "help wanted"]')
  echo "  Created #$NUM: Pattern Doc: $platform — $pattern"
done

# Feature requests
NUM=$(create_issue \
  "Add TikTok Ads as a platform" \
  "## Proposal\n\nAdd TikTok Ads as the 15th platform in the hub.\n\n## Why\n\nTikTok has a growing Marketing API, significant ad spend (~\$20B+ annually), and no centralized open-source tooling.\n\n## What's Needed\n\n- \`platforms/tiktok-ads/PLATFORM.yaml\`\n- \`platforms/tiktok-ads/README.md\` with upstream repo links\n- Platform-specific agent\n- Wiki page\n- Pattern docs for creative best practices, Spark Ads, etc.\n\n## References\n\n- [TikTok Marketing API](https://business-api.tiktok.com/portal/docs)\n- [tiktok/tiktok-business-api-sdk](https://github.com/tiktok/tiktok-business-api-sdk)" \
  '["platform-request", "enhancement"]')
echo "  Created #$NUM: Add TikTok Ads"

NUM=$(create_issue \
  "Add DV360 (Google Display & Video 360) as a platform" \
  "## Proposal\n\nAdd DV360 as a platform alongside The Trade Desk in the programmatic category.\n\n## Why\n\nDV360 is the other major DSP. Many advertisers run both TTD and DV360. Having both in the hub enables true cross-DSP comparison patterns." \
  '["platform-request", "enhancement"]')
echo "  Created #$NUM: Add DV360"

echo ""
echo "Done! Created starter issues for contributor onboarding."
echo "Pin the most important ones at: https://github.com/$REPO/issues"
