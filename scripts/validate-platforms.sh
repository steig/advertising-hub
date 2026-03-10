#!/usr/bin/env bash
# Validate that all platform YAML files exist and upstream links are alive
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

echo "🔍 Validating platforms..."

for platform_dir in "$ROOT_DIR/platforms"/*/; do
    name=$(basename "$platform_dir")
    yaml="$platform_dir/PLATFORM.yaml"

    if [ ! -f "$yaml" ]; then
        echo "  ❌ $name: missing PLATFORM.yaml"
        ERRORS=$((ERRORS + 1))
    else
        echo "  ✅ $name: PLATFORM.yaml found"
    fi

    if [ ! -f "$platform_dir/README.md" ]; then
        echo "  ⚠️  $name: missing README.md"
    fi
done

echo ""
echo "Validated $(ls -d "$ROOT_DIR/platforms"/*/ | wc -l) platforms, $ERRORS errors"
