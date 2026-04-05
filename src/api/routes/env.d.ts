declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    JWT_SECRET: string;
    TEST_MIGRATIONS: D1Migration[];
  }
}
