#!/usr/bin/env bash
# Convert agents to formats for different tools
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
AGENTS_DIR="$ROOT_DIR/agents"

echo "🔄 Converting agents for all supported tools..."

# Claude Code - native .md, no conversion needed
echo "  ✅ Claude Code: agents are native .md format"

# Cursor - convert to .mdc rules
if [ "${1:-}" = "--tool" ] && [ "${2:-}" = "cursor" ] || [ -z "${1:-}" ]; then
    echo "  📝 Cursor: generating .mdc rules..."
    mkdir -p "$ROOT_DIR/integrations/cursor/rules"
    for agent in "$AGENTS_DIR"/**/*.md; do
        [ -f "$agent" ] || continue
        basename=$(basename "$agent" .md)
        cp "$agent" "$ROOT_DIR/integrations/cursor/rules/${basename}.mdc"
    done
fi

echo "✅ Conversion complete"
