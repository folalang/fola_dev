#!/usr/bin/env bash
# Checks that every internal link in public/ points at an existing page and,
# when it has a #fragment, at an existing id on that page.
set -uo pipefail
cd "$(dirname "$0")/../public" || { echo "build the site first"; exit 1; }
bad=0
while IFS= read -r html; do
  page="/${html#./}"
  page="${page%index.html}"
  grep -o 'href="[^"]*"' "$html" | sed 's/^href="//; s/"$//' | sort -u | while IFS= read -r href; do
    case "$href" in
      http*|mailto:*|//*) continue ;;
      \#*) target="$html"; frag="${href#\#}" ;;
      /*) path="${href%%#*}"; frag=""; [[ "$href" == *#* ]] && frag="${href#*#}"
          target=".${path}"; [[ "$target" == */ ]] && target="${target}index.html"
          [ -d "$target" ] && target="$target/index.html" ;;
      *) frag=""; target="$(dirname "$html")/${href%%#*}" ;;
    esac
    if [ ! -f "$target" ]; then echo "MISSING  $page -> $href"; continue; fi
    if [ -n "$frag" ] && ! grep -q "id=\"$frag\"" "$target"; then echo "ANCHOR   $page -> $href"; fi
  done
done < <(find . -name '*.html' | sort) | tee /dev/stderr | grep -q . && bad=1
[ "$bad" -eq 0 ] && echo "all internal links resolve"
exit "$bad"
