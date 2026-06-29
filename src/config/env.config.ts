import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url('DATABASE_URL is required and must be a valid URL'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET is required and must be at least 32 characters')
    .optional(),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET is required and must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET is required and must be at least 32 characters'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
  SMTP_HOST: z.string().min(1, 'SMTP_HOST is required'),
  SMTP_PORT: z.coerce.number().min(1, 'SMTP_PORT is required'),
  SMTP_USER: z.string().min(1, 'SMTP_USER is required'),
  SMTP_PASS: z.string().min(1, 'SMTP_PASS is required'),
  SMTP_FROM: z.string().email('SMTP_FROM is required and must be a valid email'),
  APP_URL: z.string().url('APP_URL is required'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

const envParse = envSchema.safeParse(process.env);

if (!envParse.success) {
  console.error('❌ Missing or invalid environment variables:');
  const errors = envParse.error.format();
  Object.entries(errors).forEach(([key, value]) => {
    if (key !== '_errors') {
      console.error(`  - ${key}: ${(value as any)._errors.join(', ')}`);
    }
  });
  process.exit(1);
}

export const env = envParse.data;
export type EnvType = z.infer<typeof envSchema>;
