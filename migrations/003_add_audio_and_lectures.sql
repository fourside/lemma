CREATE TABLE audio_episodes (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id          INTEGER NOT NULL REFERENCES weeks(id),
  r2_key           TEXT NOT NULL,
  duration_seconds INTEGER,
  generated_at     TEXT NOT NULL,
  UNIQUE(week_id)
);

CREATE TABLE lecture_texts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id      INTEGER NOT NULL REFERENCES weeks(id),
  type         TEXT NOT NULL,
  content      TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  UNIQUE(week_id, type)
);
