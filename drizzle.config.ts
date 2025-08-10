import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  driver: 'expo-sqlite',
  dbCredentials: {
    url: 'defesa-app.db',
  },
} satisfies Config;