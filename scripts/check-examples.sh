#!/usr/bin/env bash
# Runs every ```fola block in content/ (those get a "Run" button on the site)
# and fails if any of them errors. Usage: scripts/check-examples.sh [fola-binary]
set -uo pipefail
cd "$(dirname "$0")/.."
FOLA="${1:-${FOLA:-fola}}"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

failed=0
total=0
while IFS= read -r md; do
  awk -v dir="$tmp" -v base="$(echo "$md" | tr '/' '_')" '
    /^```fola[[:space:]]*$/ { n++; file = sprintf("%s/%s.%03d.fola", dir, base, n); inblock = 1; next }
    inblock && /^```/       { inblock = 0; close(file); next }
    inblock                 { print > file }
  ' "$md"
done < <(find content -name '*.md' | sort)

for f in "$tmp"/*.fola; do
  [ -e "$f" ] || continue
  total=$((total + 1))
  if ! out="$(cd "$tmp" && timeout 20 "$FOLA" run "$f" 2>&1)"; then
    failed=$((failed + 1))
    echo "FAIL $(basename "$f")"
    echo "$out" | grep -v '^\s*\^\|^/\|^    ' | head -5 | sed 's/^/    /'
  fi
done
echo "$((total - failed))/$total examples passed"
[ "$failed" -eq 0 ]
