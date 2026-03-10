#!/usr/bin/env bash
# Interactive installer for Advertising Hub agents
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo ""
echo "  +------------------------------------------------+"
echo "  |   The Advertising Hub — Agent Installer         |"
echo "  +------------------------------------------------+"
echo ""

# Claude Code
if [ -d "$HOME/.claude" ] || command -v claude &>/dev/null; then
    echo "  [*] Claude Code detected"
    read -p "  Install agents to ~/.claude/agents/advertising-hub/? [Y/n] " yn
    if [ "${yn:-Y}" != "n" ]; then
        mkdir -p "$HOME/.claude/agents/advertising-hub"
        cp -r "$ROOT_DIR/agents/"* "$HOME/.claude/agents/advertising-hub/"
        echo "  ✅ Installed to ~/.claude/agents/advertising-hub/"
    fi
else
    echo "  [ ] Claude Code not detected"
fi

echo ""
echo "  For other tools, run: ./scripts/convert.sh first"
echo "  Then manually install from integrations/<tool>/"
echo ""
