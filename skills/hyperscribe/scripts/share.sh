#!/usr/bin/env bash
# Deploy a single HTML file to Vercel and print the live URL.
# Usage: share.sh <path-to-html>

set -e

HTML_PATH="${1:-}"
if [ -z "$HTML_PATH" ] || [ ! -f "$HTML_PATH" ]; then
  echo "share.sh: missing or invalid HTML path. Usage: share.sh <file.html>" >&2
  exit 2
fi

if ! command -v vercel >/dev/null 2>&1; then
  echo "share.sh: vercel CLI not found. Install: npm i -g vercel" >&2
  exit 127
fi

# Create a temp deploy dir
TMP=$(mktemp -d -t hs-share-XXXXXX)
cp "$HTML_PATH" "$TMP/index.html"
cat > "$TMP/vercel.json" <<'EOF'
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false
}
EOF

# Deploy and capture URL
(cd "$TMP" && vercel --prod --yes 2>&1) | tee "$TMP/deploy.log"
URL=$(grep -oE 'https://[^[:space:]]+\.vercel\.app[^[:space:]]*' "$TMP/deploy.log" | tail -1)

if [ -z "$URL" ]; then
  echo "share.sh: deploy finished but no URL found. See log at $TMP/deploy.log" >&2
  exit 1
fi

echo
echo "Deployed: $URL"

# Cleanup (keep log for troubleshooting if user wants it)
# rm -rf "$TMP"
