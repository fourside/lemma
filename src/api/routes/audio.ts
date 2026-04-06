import { Hono } from "hono";
import type { Env } from "../index";
import { getAudioFile } from "../services/r2";

export const audioRoutes = new Hono<Env>();

audioRoutes.get("/:file", async (c) => {
  const file = c.req.param("file");
  if (!file.endsWith(".m4a")) {
    return c.json({ error: "Not found" }, 404);
  }

  const rangeHeader = c.req.header("Range");
  const result = await getAudioFile(
    c.env.CONTENT_BUCKET,
    `audio/${file}`,
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
