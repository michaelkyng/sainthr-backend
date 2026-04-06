// Ensure .env at repo root is loaded when running from apps/api
import { config } from 'dotenv';
config({ path: '../../.env' });
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
