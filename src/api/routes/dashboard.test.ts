import { env } from "cloudflare:test";
import * as v from "valibot";
import { beforeEach, describe, expect, it } from "vitest";
import { DashboardDataSchema } from "../../models/dashboard";
import { createDb } from "../db";
import app from "../index";
import { authHeaders, setupTestEnv } from "./test-helper";

let token: string;

beforeEach(async () => {
  token = await setupTestEnv();
});

describe("GET /api/dashboard", () => {
  it("returns dashboard with no progress", async () => {
    const res = await app.request("/api/dashboard", authHeaders(token), env);

    expect(res.status).toBe(200);
    const body = v.parse(DashboardDataSchema, await res.json());
    expect(body.totalWeeks).toBe(4);
    expect(body.completedWeeks).toBe(0);
    expect(body.completionPercent).toBe(0);
    expect(body.nextWeek).toEqual({
      weekId: 1,
      courseTitle: "高校数学の橋渡し",
      weekTitle: "論理と集合",
      weekNumber: 1,
    });
    expect(body.recentTest).toBeNull();
  });

  it("reflects progress updates", async () => {
    const db = createDb(env.DB);
    await db
      .insertInto("progress")
      .values({
        week_id: 1,
        status: "test_done",
        test_score: 85,
        test_notes: null,
        started_at: "2025-01-01T00:00:00Z",
        completed_at: "2025-01-02T00:00:00Z",
        updated_at: "2025-01-02T00:00:00Z",
      })
      .execute();

    const res = await app.request("/api/dashboard", authHeaders(token), env);

    const body = v.parse(DashboardDataSchema, await res.json());
    expect(body.completedWeeks).toBe(1);
    expect(body.completionPercent).toBe(25);
    expect(body.nextWeek?.weekId).toBe(2);
    expect(body.recentTest).toEqual({
      weekTitle: "論理と集合",
      score: 85,
    });
  });
});
