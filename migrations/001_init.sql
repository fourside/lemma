CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE courses (
  id         INTEGER PRIMARY KEY,
  phase      INTEGER NOT NULL,
  title      TEXT NOT NULL,
  subtitle   TEXT,
  sort_order INTEGER NOT NULL
);

CREATE TABLE weeks (
  id          INTEGER PRIMARY KEY,
  course_id   INTEGER NOT NULL REFERENCES courses(id),
  week_number INTEGER NOT NULL,
  title       TEXT NOT NULL,
  keywords    TEXT,
  is_test     INTEGER NOT NULL DEFAULT 0,
  UNIQUE(course_id, week_number)
);

CREATE TABLE progress (
  week_id      INTEGER PRIMARY KEY REFERENCES weeks(id),
  status       TEXT NOT NULL DEFAULT 'not_started',
  test_score   INTEGER,
  test_notes   TEXT,
  started_at   TEXT,
  completed_at TEXT,
  updated_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE INDEX idx_weeks_course_id ON weeks(course_id);
