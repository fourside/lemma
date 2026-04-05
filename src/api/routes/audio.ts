import { Hono } from "hono";
import type { Env } from "../index";
import { getAudioFile } from "../services/r2";

export const audioRoutes = new Hono<Env>();

audioRoutes.get("/:slug.m4a", async (c) => {
  const slug = c.req.param("slug");
  const rangeHeader = c.req.header("Range");

  const result = await getAudioFile(
    c.env.CONTENT_BUCKET,
    `audio/${slug}.m4a`,
    rangeHeader,
  );

  if (!result) {
    return c.json({ error: "Audio not found" }, 404);
  }

  return new Response(result.body, {
    status: result.status,
    headers: {
      ...result.headers,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
});
