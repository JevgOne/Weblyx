#!/bin/bash
# Add Twitter Cards to all pages that have openGraph but no twitter
cd /Users/zen/weblyx

FILES=(
  "app/kontakt/page.tsx"
  "app/sluzby/page.tsx"
  "app/o-nas/page.tsx"
  "app/portfolio/page.tsx"
  "app/faq/page.tsx"
  "app/leistungen/page.tsx"
  "app/uber-uns/page.tsx"
  "app/anfrage/page.tsx"
  "app/preise/page.tsx"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    count=$(grep -c "twitter" "$f")
    if [ "$count" -eq "0" ]; then
      echo "Processing: $f"
    fi
  fi
done
