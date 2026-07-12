import { defineConfig } from 'drizzle-kit';
import envConfig from './src/config/env.config.js';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.js',
  dialect: 'postgresql',
  dbCredentials: {
    url: envConfig.DATABASE_URL,
  },
});