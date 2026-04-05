#!/bin/bash
# Batch-generate all static content for a phase
# Usage: ./scripts/batch-generate.sh <phase_number>
set -euo pipefail

PHASE=$1

# Map phase to course IDs (from seed.sql)
case $PHASE in
  0) COURSES="1" ;;
  1) COURSES="2 3" ;;
  2) COURSES="4 5" ;;
  3) COURSES="6 7" ;;
  4) COURSES="8 9" ;;
  5) COURSES="10 11" ;;
  6) COURSES="12 13" ;;
  *) echo "Unknown phase: $PHASE"; exit 1 ;;
esac

for COURSE_ID in $COURSES; do
  WEEK_COUNT=$(grep -cE "^\s+\([0-9]+, $COURSE_ID, [0-9]+, '" scripts/seed.sql) || true
  if [ "$WEEK_COUNT" -eq 0 ]; then
    echo "No weeks found for course $COURSE_ID"
    continue
  fi

  for WEEK_NUM in $(seq 1 "$WEEK_COUNT"); do
    ./scripts/generate-lecture.sh "$COURSE_ID" "$WEEK_NUM" all
    echo ""
  done
done

echo "Phase $PHASE batch generation complete."
