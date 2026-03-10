#!/usr/bin/env bash
# Hub Health Dashboard
# Shows the current status of all platforms, agents, MCP servers, and wiki pages.
# Run anytime: ./scripts/hub-health.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo ""
echo "  ╔══════════════════════════════════════════════════╗"
echo "  ║         Advertising Hub — Health Dashboard       ║"
echo "  ╚══════════════════════════════════════════════════╝"
echo ""

# Platforms
echo "📡 PLATFORMS"
echo "───────────────────────────────────────────────────"
PLATFORM_COUNT=0
for p in "$ROOT_DIR"/platforms/*/; do
  name=$(basename "$p")
  has_yaml="❌"; has_readme="❌"; patterns=0; scripts=0
  [ -f "$p/PLATFORM.yaml" ] && has_yaml="✅"
  [ -f "$p/README.md" ] && has_readme="✅"
  patterns=$(find "$p/patterns" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  scripts=$(find "$p/scripts" -name "*.py" 2>/dev/null | wc -l | tr -d ' ')
  printf "  %-20s YAML:%s  README:%s  Patterns:%-3s Scripts:%-3s\n" "$name" "$has_yaml" "$has_readme" "$patterns" "$scripts"
  PLATFORM_COUNT=$((PLATFORM_COUNT + 1))
done
echo "  Total: $PLATFORM_COUNT platforms"

# Agents
echo ""
echo "🤖 AGENTS"
echo "───────────────────────────────────────────────────"
paid=$(find "$ROOT_DIR/agents/paid-media" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
specific=$(find "$ROOT_DIR/agents/platform-specific" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
cross=$(find "$ROOT_DIR/agents/cross-platform" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
orch=$(find "$ROOT_DIR/agents/orchestrator" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "  Paid Media Division:   $paid agents"
echo "  Platform Specialists:  $specific agents"
echo "  Cross-Platform:        $cross agents"
echo "  Orchestrator:          $orch agents"
echo "  Total:                 $((paid + specific + cross + orch)) agents"

# MCP Servers
echo ""
echo "🔌 MCP SERVERS"
echo "───────────────────────────────────────────────────"
for m in "$ROOT_DIR"/mcp-servers/*/; do
  [ -d "$m" ] || continue
  name=$(basename "$m")
  [ "$name" = "templates" ] && continue
  has_readme="❌"
  [ -f "$m/README.md" ] && has_readme="✅"
  echo "  $name: $has_readme"
done

# Wiki
echo ""
echo "📖 WIKI PAGES"
echo "───────────────────────────────────────────────────"
wiki_count=$(find "$ROOT_DIR/wiki" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
echo "  Total: $wiki_count pages"

# Core Package
echo ""
echo "🔧 CORE PACKAGE"
echo "───────────────────────────────────────────────────"
auth_count=$(find "$ROOT_DIR/core/auth" -name "*.py" ! -name "__init__.py" 2>/dev/null | wc -l | tr -d ' ')
model_count=$(find "$ROOT_DIR/core/models" -name "*.py" ! -name "__init__.py" 2>/dev/null | wc -l | tr -d ' ')
echo "  Auth providers: $auth_count"
echo "  Data models:    $model_count"

# CI/CD
echo ""
echo "⚙️  CI/CD WORKFLOWS"
echo "───────────────────────────────────────────────────"
for wf in "$ROOT_DIR"/.github/workflows/*.yml; do
  [ -f "$wf" ] || continue
  echo "  ✅ $(basename "$wf")"
done

# Scripts
echo ""
echo "🛠️  SCRIPTS"
echo "───────────────────────────────────────────────────"
for s in "$ROOT_DIR"/scripts/*; do
  [ -f "$s" ] || continue
  echo "  $(basename "$s")"
done

# Summary
echo ""
echo "═══════════════════════════════════════════════════"
total_files=$(find "$ROOT_DIR" -type f -not -path "*/.git/*" | wc -l | tr -d ' ')
total_md=$(find "$ROOT_DIR" -name "*.md" -not -path "*/.git/*" | wc -l | tr -d ' ')
total_py=$(find "$ROOT_DIR" -name "*.py" -not -path "*/.git/*" | wc -l | tr -d ' ')
echo "  Total files: $total_files  (Markdown: $total_md, Python: $total_py)"
echo "═══════════════════════════════════════════════════"
