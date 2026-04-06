CREATE TABLE markers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id         INTEGER NOT NULL REFERENCES weeks(id),
  text            TEXT NOT NULL,
  start_offset    INTEGER NOT NULL,
  length          INTEGER NOT NULL,
  section_heading TEXT,
  note            TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_markers_week_id ON markers(week_id);
