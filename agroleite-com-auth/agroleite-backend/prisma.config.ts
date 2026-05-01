// Prisma configuration with shadow database support
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    // Use a separate shadow DB for migrations (required when the main user
    // cannot CREATE DATABASE). Set SHADOW_DATABASE_URL in .env.
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
