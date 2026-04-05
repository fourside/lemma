import { Hono } from "hono";
import * as v from "valibot";
import { LoginRequestSchema } from "../../models/user";
import type { Env } from "../index";
import { signJwt, verifyPassword } from "../middleware/auth";

export const authRoutes = new Hono<Env>();

authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const result = v.safeParse(LoginRequestSchema, body);
  if (!result.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { name, password } = result.output;
  const db = c.get("db");

  const user = await db
    .selectFrom("users")
    .select(["id", "name", "password_hash"])
    .where("name", "=", name)
    .executeTakeFirst();

  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const token = await signJwt(user.id, c.env.JWT_SECRET);

  return c.json({
    token,
    user: { id: user.id, name: user.name },
  });
});
