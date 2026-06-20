import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM: z.string().email(),
  APP_URL: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error(
    '❌ Invalid environment variables:',
    JSON.stringify(envParse.error.format(), null, 2),
  );
  process.exit(1);
}

export const env = envParse.data;
export type EnvType = z.infer<typeof envSchema>;
