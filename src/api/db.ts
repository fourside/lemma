import type { Generated } from "kysely";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { ProgressStatus } from "../models/week";

const dbCache = new WeakMap<D1Database, Kysely<Database>>();

export interface Database {
  users: {
    id: number;
    name: string;
    password_hash: string;
    created_at: string;
  };
  courses: {
    id: number;
    phase: number;
    title: string;
    subtitle: string | null;
    sort_order: number;
  };
  weeks: {
    id: number;
    course_id: number;
    week_number: number;
    title: string;
    keywords: string | null;
    is_test: number;
  };
  progress: {
    week_id: number;
    status: ProgressStatus;
    test_score: number | null;
    test_notes: string | null;
    started_at: string | null;
    completed_at: string | null;
    updated_at: string;
  };
  audio_episodes: {
    id: Generated<number>;
    week_id: number;
    r2_key: string;
    duration_seconds: number | null;
    generated_at: string;
  };
  lecture_texts: {
    id: Generated<number>;
    week_id: number;
    type: string;
    content: string;
    generated_at: string;
  };
  markers: {
    id: Generated<number>;
    week_id: number;
    text: string;
    start_offset: number;
    length: number;
    section_heading: string | null;
    note: string | null;
    created_at: string;
  };
  test_attempts: {
    id: Generated<number>;
    week_id: number;
    score: number;
    max_score: number;
    answers_json: string | null;
    feedback_json: string | null;
    attempted_at: string;
  };
}

export function createDb(d1: D1Database): Kysely<Database> {
  const cached = dbCache.get(d1);
  if (cached) return cached;
  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: d1 }),
  });
  dbCache.set(d1, db);
  return db;
}
