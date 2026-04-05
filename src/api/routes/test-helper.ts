import { env } from "cloudflare:test";
import { createDb } from "../db";
import { hashPassword, signJwt } from "../middleware/auth";

export async function cleanupTables() {
  const db = createDb(env.DB);
  await db.deleteFrom("progress").execute();
  await db.deleteFrom("weeks").execute();
  await db.deleteFrom("courses").execute();
  await db.deleteFrom("users").execute();
}

export async function setupTestUser(): Promise<string> {
  const db = createDb(env.DB);
  const hash = await hashPassword("password");
  await db
    .insertInto("users")
    .values({
      id: 1,
      name: "testuser",
      password_hash: hash,
      created_at: "2025-01-01T00:00:00Z",
    })
    .execute();
  return signJwt(1, env.JWT_SECRET);
}

export async function seedCurriculum() {
  const db = createDb(env.DB);
  await db
    .insertInto("courses")
    .values([
      {
        id: 1,
        phase: 0,
        title: "高校数学の橋渡し",
        subtitle: null,
        sort_order: 1,
      },
      {
        id: 2,
        phase: 1,
        title: "計算機科学の数学",
        subtitle: "MIT 6.042J 相当",
        sort_order: 2,
      },
    ])
    .execute();
  await db
    .insertInto("weeks")
    .values([
      {
        id: 1,
        course_id: 1,
        week_number: 1,
        title: "論理と集合",
        keywords: "命題, 集合",
        is_test: 0,
      },
      {
        id: 2,
        course_id: 1,
        week_number: 2,
        title: "数と式の道具箱",
        keywords: "指数, 対数",
        is_test: 0,
      },
      {
        id: 3,
        course_id: 1,
        week_number: 3,
        title: "数え上げ + テスト",
        keywords: "順列, 組合せ",
        is_test: 1,
      },
      {
        id: 4,
        course_id: 2,
        week_number: 1,
        title: "証明の技法",
        keywords: "直接証明, 背理法",
        is_test: 0,
      },
    ])
    .execute();
}

export async function setupTestEnv(): Promise<string> {
  await cleanupTables();
  const token = await setupTestUser();
  await seedCurriculum();
  return token;
}

export function authHeaders(
  token: string,
  options?: { method?: string; body?: object },
): RequestInit {
  const method = options?.method ?? (options?.body ? "PUT" : "GET");
  return {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  };
}
