#!/usr/bin/env bash
# Quick setup for new contributors
# Run: ./scripts/setup-dev.sh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "  🎯 Advertising Hub — Developer Setup"
echo "  ═══════════════════════════════════════"
echo ""

# Check Python
if command -v python3 &>/dev/null; then
  PY_VERSION=$(python3 --version 2>&1)
  echo "  ✅ Python: $PY_VERSION"
else
  echo "  ❌ Python 3 not found. Install from https://python.org"
  exit 1
fi

# Check Node (optional, for MCP templates)
if command -v node &>/dev/null; then
  NODE_VERSION=$(node --version 2>&1)
  echo "  ✅ Node.js: $NODE_VERSION"
else
  echo "  ⚠️  Node.js not found (optional, needed for Node MCP templates)"
fi

# Check git
if command -v git &>/dev/null; then
  echo "  ✅ Git: $(git --version)"
else
  echo "  ❌ Git not found"
  exit 1
fi

echo ""

# Create virtual environment
if [ ! -d ".venv" ]; then
  echo "  Creating Python virtual environment..."
  python3 -m venv .venv
  echo "  ✅ Virtual environment created"
else
  echo "  ✅ Virtual environment exists"
fi

# Activate and install
echo "  Installing core package..."
source .venv/bin/activate
pip install -q -e "./core" 2>/dev/null || pip install -q -e "./core" --break-system-packages 2>/dev/null
echo "  ✅ Core package installed"

# Create .env template
if [ ! -f ".env" ]; then
  cat > .env << 'ENVEOF'
# Advertising Hub — Environment Configuration
# Copy this to .env and fill in credentials for platforms you use.
# NEVER commit this file (it's in .gitignore).

# Google Ads
GOOGLE_ADS_DEVELOPER_TOKEN=
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_REFRESH_TOKEN=
GOOGLE_ADS_LOGIN_CUSTOMER_ID=

# Meta Ads
META_ACCESS_TOKEN=
META_APP_ID=
META_APP_SECRET=

# Microsoft Ads
MICROSOFT_ADS_CLIENT_ID=
MICROSOFT_ADS_CLIENT_SECRET=
MICROSOFT_ADS_REFRESH_TOKEN=
MICROSOFT_ADS_DEVELOPER_TOKEN=

# Amazon Ads
AMAZON_ADS_CLIENT_ID=
AMAZON_ADS_CLIENT_SECRET=
AMAZON_ADS_REFRESH_TOKEN=

# LinkedIn Ads
LINKEDIN_ACCESS_TOKEN=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Pinterest Ads
PINTEREST_ACCESS_TOKEN=
PINTEREST_APP_ID=
PINTEREST_APP_SECRET=

# The Trade Desk
TTD_PARTNER_ID=
TTD_LOGIN=
TTD_PASSWORD=

# Demandbase
DEMANDBASE_API_KEY=

# Criteo
CRITEO_CLIENT_ID=
CRITEO_CLIENT_SECRET=
ENVEOF
  echo "  ✅ Created .env template (fill in your credentials)"
else
  echo "  ✅ .env already exists"
fi

# Verify .env is in .gitignore
if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
  echo ".env" >> .gitignore
  echo "  ✅ Added .env to .gitignore"
fi

echo ""
echo "  ═══════════════════════════════════════"
echo "  Setup complete! Next steps:"
echo ""
echo "  1. Fill in credentials: nano .env"
echo "  2. Activate the venv:   source .venv/bin/activate"
echo "  3. Run a script:        python platforms/google-ads/scripts/budget_pacing.py --help"
echo "  4. Check hub health:    ./scripts/hub-health.sh"
echo ""
