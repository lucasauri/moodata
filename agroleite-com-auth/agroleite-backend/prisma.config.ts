// prisma.config.ts
// O `prisma generate` apenas gera o client a partir do schema.prisma —
// não precisa da DATABASE_URL em tempo de build. O `db push` e `migrate`
// são executados em tempo de runtime (start command), quando as variáveis
// de ambiente já estão disponíveis.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
});
