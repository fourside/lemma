CREATE TABLE test_attempts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  week_id       INTEGER NOT NULL REFERENCES weeks(id),
  score         INTEGER NOT NULL,
  max_score     INTEGER NOT NULL DEFAULT 100,
  answers_json  TEXT,
  feedback_json TEXT,
  attempted_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_test_attempts_week_id ON test_attempts(week_id);
