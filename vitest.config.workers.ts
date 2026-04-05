import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { cloudflareTest } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

async function readD1Migrations(
  migrationsDir: string,
): Promise<{ name: string; queries: string[] }[]> {
  const files = await readdir(migrationsDir);
  const sqlFiles = files.filter((f) => f.endsWith(".sql")).sort();
  const migrations = [];
  for (const file of sqlFiles) {
    const content = await readFile(path.join(migrationsDir, file), "utf-8");
    const queries = content
      .split(";")
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .map((q) => `${q};`);
    migrations.push({ name: file, queries });
  }
  return migrations;
}

export default defineConfig(async () => {
  const migrationsPath = path.join(import.meta.dirname, "migrations");
  const migrations = await readD1Migrations(migrationsPath);

  return {
    plugins: [
      cloudflareTest({
        wrangler: {
          configPath: "./wrangler.test.toml",
        },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      include: ["src/api/routes/**/*.test.ts"],
      setupFiles: ["./src/api/routes/test-setup.ts"],
    },
  };
});
