#!/usr/bin/env bash
# Lint agent files for required sections
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
ERRORS=0

echo "🔍 Linting agents..."

for agent in "$ROOT_DIR/agents"/**/*.md; do
    [ -f "$agent" ] || continue
    name=$(basename "$agent")

    # Check for required sections
    if ! grep -q "^## Role Definition" "$agent" 2>/dev/null && ! grep -q "^## Identity" "$agent" 2>/dev/null; then
        echo "  ⚠️  $name: missing Role Definition or Identity section"
        ERRORS=$((ERRORS + 1))
    fi

    if ! grep -q "^---" "$agent" 2>/dev/null; then
        echo "  ⚠️  $name: missing frontmatter"
        ERRORS=$((ERRORS + 1))
    fi
done

if [ $ERRORS -eq 0 ]; then
    echo "✅ All agents pass lint"
else
    echo "❌ $ERRORS issues found"
    exit 1
fi
