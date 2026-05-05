// prisma.config.ts – versão final garantida
import "dotenv/config";                     // << IMPORTA .env imediatamente
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    // Esta linha usa a variável SHADOW_DATABASE_URL que já está no .env
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
