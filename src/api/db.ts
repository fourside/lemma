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
