import { env } from "cloudflare:test";
import * as v from "valibot";
import { beforeEach, describe, expect, it } from "vitest";
import { CourseWithProgressSchema } from "../../models/course";
import app from "../index";
import { authHeaders, setupTestEnv } from "./test-helper";

let token: string;

beforeEach(async () => {
  token = await setupTestEnv();
});

describe("GET /api/courses", () => {
  it("returns all courses with progress", async () => {
    const res = await app.request("/api/courses", authHeaders(token), env);

    expect(res.status).toBe(200);
    const body = v.parse(v.array(CourseWithProgressSchema), await res.json());
    expect(body).toHaveLength(2);

    const first = body[0];
    const second = body[1];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(first?.title).toBe("高校数学の橋渡し");
    expect(first?.totalWeeks).toBe(3);
    expect(first?.completedWeeks).toBe(0);
    expect(second?.title).toBe("計算機科学の数学");
    expect(second?.totalWeeks).toBe(1);
  });
});
