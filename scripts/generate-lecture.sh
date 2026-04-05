#!/bin/bash
# Generate lecture content for a single week
# Usage: ./scripts/generate-lecture.sh <course_id> <week_number> [audio|text|test|all]
set -euo pipefail

COURSE=$1
WEEK=$2
TYPE=${3:-all}
SLUG="course${COURSE}-week${WEEK}"
CURRICULUM="$(cat cs-curriculum.md 2>/dev/null || cat cs-curriculum_extra.md)"

mkdir -p out/lectures out/tests

generate() {
  local prompt_file=$1
  local output_file=$2
  local title=$3
  local keywords=$4

  local prompt
  prompt=$(cat "$prompt_file")
  prompt="${prompt//\{\{TITLE\}\}/$title}"
  prompt="${prompt//\{\{KEYWORDS\}\}/$keywords}"
  prompt="${prompt//\{\{CURRICULUM\}\}/$CURRICULUM}"

  claude -p "$prompt" > "$output_file"
  echo "  -> $output_file"
}

# Get week info from seed data (simple grep from seed.sql)
WEEK_LINE=$(grep "($COURSE, $WEEK," scripts/seed.sql | head -1) || true
if [ -z "$WEEK_LINE" ]; then
  echo "Error: Week not found in seed.sql for course=$COURSE week=$WEEK"
  exit 1
fi

TITLE=$(echo "$WEEK_LINE" | sed "s/.*'\\([^']*\\)', '\\([^']*\\)'.*/\\1/")
KEYWORDS=$(echo "$WEEK_LINE" | sed "s/.*'\\([^']*\\)', '\\([^']*\\)'.*/\\2/")

echo "=== ${SLUG}: ${TITLE} ==="

if [ "$TYPE" = "audio" ] || [ "$TYPE" = "all" ]; then
  echo "Generating audio lecture text..."
  generate prompts/lecture-audio.md "out/lectures/${SLUG}-audio.md" "$TITLE" "$KEYWORDS"
fi

if [ "$TYPE" = "text" ] || [ "$TYPE" = "all" ]; then
  echo "Generating text lecture..."
  generate prompts/lecture-text.md "out/lectures/${SLUG}-text.md" "$TITLE" "$KEYWORDS"
fi

if [ "$TYPE" = "test" ] || [ "$TYPE" = "all" ]; then
  echo "Generating test pool..."
  generate prompts/test-pool.md "out/tests/${SLUG}.json" "$TITLE" "$KEYWORDS"
fi

echo "Done: ${SLUG}"
