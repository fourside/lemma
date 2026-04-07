export function r2KeyToSlug(key: string): string {
  return key.replace(/^audio\//, "").replace(/\.m4a$/, "");
}

export async function getAudioFile(
  bucket: R2Bucket,
  key: string,
  rangeHeader: string | undefined,
): Promise<{
  body: ReadableStream;
  status: number;
  headers: Record<string, string>;
} | null> {
  const object = rangeHeader
    ? await bucket.get(key, { range: parseRange(rangeHeader) })
    : await bucket.get(key);

  if (!object) return null;

  const headers: Record<string, string> = {
    "Content-Type": "audio/mp4",
    ETag: object.etag,
  };

  if (object.range) {
    const r = object.range;
    if ("offset" in r && "length" in r) {
      const end = r.offset + r.length - 1;
      headers["Content-Range"] = `bytes ${r.offset}-${end}/${object.size}`;
      headers["Content-Length"] = String(r.length);
    }
  } else {
    headers["Content-Length"] = String(object.size);
  }

  return {
    body: object.body,
    status: object.range ? 206 : 200,
    headers,
  };
}

function parseRange(header: string): R2Range {
  const match = header.match(/bytes=(\d+)-(\d*)/);
  if (!match) return { offset: 0 };
  const offset = Number(match[1]);
  const end = match[2];
  if (end) {
    return { offset, length: Number(end) - offset + 1 };
  }
  return { offset };
}

export async function getTestPool(
  bucket: R2Bucket,
  key: string,
): Promise<unknown | null> {
  const object = await bucket.get(key);
  if (!object) return null;
  return object.json();
}
