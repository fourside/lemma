#!/bin/bash
# Show content generation status for all weeks
# Usage: ./scripts/content-status.sh [--phase N]
set -euo pipefail

FILTER_PHASE="${2:-}"

printf "%-8s %-30s %6s %6s %6s %6s\n" "Week" "Title" "Audio" "Text" "Test" "M4A"
printf "%-8s %-30s %6s %6s %6s %6s\n" "--------" "------------------------------" "------" "------" "------" "------"

while IFS= read -r line; do
  # Parse: (id, course_id, week_number, 'title', 'keywords', is_test)
  COURSE_ID=$(echo "$line" | sed "s/.*(\([0-9]*\), \([0-9]*\), \([0-9]*\),.*/\2/")
  WEEK_NUM=$(echo "$line" | sed "s/.*(\([0-9]*\), \([0-9]*\), \([0-9]*\),.*/\3/")
  TITLE=$(echo "$line" | sed "s/[^']*'\\([^']*\\)'.*/\\1/" | cut -c1-30)
  SLUG="course${COURSE_ID}-week${WEEK_NUM}"

  if [ -n "$FILTER_PHASE" ]; then
    # Get phase for this course
    PHASE_LINE=$(grep -E "^\s+\($COURSE_ID," scripts/seed.sql | head -1) || true
    PHASE=$(echo "$PHASE_LINE" | sed "s/.*(\([0-9]*\), \([0-9]*\),.*/\2/")
    if [ "$PHASE" != "$FILTER_PHASE" ]; then
      continue
    fi
  fi

  AUDIO=$([ -f "out/lectures/${SLUG}-audio.md" ] && echo "done" || echo "-")
  TEXT=$([ -f "out/lectures/${SLUG}-text.md" ] && echo "done" || echo "-")
  TEST=$([ -f "out/tests/${SLUG}.json" ] && echo "done" || echo "-")
  M4A=$([ -f "out/audio/${SLUG}.m4a" ] && echo "done" || echo "-")

  printf "%-8s %-30s %6s %6s %6s %6s\n" "$SLUG" "$TITLE" "$AUDIO" "$TEXT" "$TEST" "$M4A"
done < <(grep -E "^\s+\([0-9]+, [0-9]+, [0-9]+, '" scripts/seed.sql)

echo ""
TOTAL=$(grep -cE "^\s+\([0-9]+, [0-9]+, [0-9]+, '" scripts/seed.sql)
mkdir -p out/lectures out/tests out/audio
AUDIO_DONE=$(find out/lectures -name "*-audio.md" | wc -l)
TEXT_DONE=$(find out/lectures -name "*-text.md" | wc -l)
TEST_DONE=$(find out/tests -name "*.json" | wc -l)
M4A_DONE=$(find out/audio -name "*.m4a" | wc -l)
printf "Total: %d weeks | Audio: %d | Text: %d | Test: %d | M4A: %d\n" "$TOTAL" "$AUDIO_DONE" "$TEXT_DONE" "$TEST_DONE" "$M4A_DONE"
