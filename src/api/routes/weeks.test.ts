import { env } from "cloudflare:test";
import * as v from "valibot";
import { beforeEach, describe, expect, it } from "vitest";
import { WeekDetailSchema, WeekWithProgressSchema } from "../../models/week";
import app from "../index";
import { authHeaders, setupTestEnv } from "./test-helper";

let token: string;

beforeEach(async () => {
  token = await setupTestEnv();
});

describe("GET /api/courses/:courseId/weeks", () => {
  it("returns weeks for a course", async () => {
    const res = await app.request(
      "/api/courses/1/weeks",
      authHeaders(token),
      env,
    );

    expect(res.status).toBe(200);
    const body = v.parse(v.array(WeekWithProgressSchema), await res.json());
    expect(body).toHaveLength(3);
    expect(body[0]?.title).toBe("論理と集合");
    expect(body[0]?.status).toBe("not_started");
    expect(body[2]?.isTest).toBe(1);
  });
});

describe("GET /api/weeks/:weekId", () => {
  it("returns week detail", async () => {
    const res = await app.request("/api/weeks/1", authHeaders(token), env);

    expect(res.status).toBe(200);
    const body = v.parse(WeekDetailSchema, await res.json());
    expect(body.title).toBe("論理と集合");
    expect(body.courseTitle).toBe("高校数学の橋渡し");
    expect(body.status).toBe("not_started");
  });

  it("returns 404 for unknown week", async () => {
    const res = await app.request("/api/weeks/999", authHeaders(token), env);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/weeks/:weekId/progress", () => {
  it("creates progress on first update", async () => {
    const res = await app.request(
      "/api/weeks/1/progress",
      authHeaders(token, {
        body: { status: "audio_done" },
      }),
      env,
    );

    expect(res.status).toBe(200);

    const detail = await app.request("/api/weeks/1", authHeaders(token), env);
    const body = v.parse(WeekDetailSchema, await detail.json());
    expect(body.status).toBe("audio_done");
    expect(body.startedAt).toBeTruthy();
  });

  it("updates existing progress", async () => {
    await app.request(
      "/api/weeks/1/progress",
      authHeaders(token, {
        body: { status: "audio_done" },
      }),
      env,
    );

    const res = await app.request(
      "/api/weeks/1/progress",
      authHeaders(token, {
        body: { status: "test_done", testScore: 90 },
      }),
      env,
    );

    expect(res.status).toBe(200);

    const detail = await app.request("/api/weeks/1", authHeaders(token), env);
    const body = v.parse(WeekDetailSchema, await detail.json());
    expect(body.status).toBe("test_done");
    expect(body.testScore).toBe(90);
    expect(body.completedAt).toBeTruthy();
  });

  it("returns 400 on invalid status", async () => {
    const res = await app.request(
      "/api/weeks/1/progress",
      authHeaders(token, {
        body: { status: "invalid" },
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("returns 404 for unknown week", async () => {
    const res = await app.request(
      "/api/weeks/999/progress",
      authHeaders(token, {
        body: { status: "audio_done" },
      }),
      env,
    );
    expect(res.status).toBe(404);
  });
});
