import { defineConfig } from "drizzle-kit";
import * as path from 'path';

// 为SQLite创建配置
export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: path.join(process.cwd(), 'data', 'aidialogsqlite.db'),
  },
});

// PostgreSQL配置（注释掉但保留）
/*
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
*/
