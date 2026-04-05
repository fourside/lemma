#!/bin/bash
# Upload generated content from out/ to R2
# Usage: ./scripts/upload-to-r2.sh [--remote]
set -euo pipefail

REMOTE_FLAG="${1:-}"

upload() {
  local src=$1
  local dest=$2
  echo "  $src -> $dest"
  npx wrangler r2 object put "lemma-content/$dest" --file "$src" $REMOTE_FLAG
}

if [ -d out/lectures ]; then
  echo "=== Uploading lectures ==="
  for f in out/lectures/*.md; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    upload "$f" "lectures/$name"
  done
fi

if [ -d out/tests ]; then
  echo "=== Uploading test pools ==="
  for f in out/tests/*.json; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    upload "$f" "tests/$name"
  done
fi

if [ -d out/audio ]; then
  echo "=== Uploading audio ==="
  for f in out/audio/*.m4a; do
    [ -f "$f" ] || continue
    name=$(basename "$f")
    upload "$f" "audio/$name"
  done
fi

echo "Upload complete."
