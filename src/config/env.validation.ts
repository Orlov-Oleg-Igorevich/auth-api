import { z } from 'zod';

export const envSchema = z.object({
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 32 characters'),
  DATABASE_URL: z.url('DATABASE_URL must be a valid URL'),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  PORT: z.coerce.number().int().min(1024).max(65535).default(3000),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  MAIL_HOST: z.string().default('smtp.google.com'),
  MAIL_PORT: z.string().default('465'),
  MAIL_USER: z.email(),
  MAIL_PASSWORD: z.string(),

  // NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;
