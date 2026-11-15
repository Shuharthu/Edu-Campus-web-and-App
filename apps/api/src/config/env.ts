import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL is required')
    .refine(
      (v) => !v.includes('{{'),
      'Replace Supabase placeholders in DATABASE_URL inside .env with your real Supabase PostgreSQL URL',
    ),
  DIRECT_URL: z
    .string()
    .refine(
      (v) => !v.includes('{{'),
      'Replace Supabase placeholders in DIRECT_URL inside .env with your real Supabase direct/session URL',
    )
    .optional(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ENABLE_LOCAL_NO_REDIS_DEV: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(30),
  MFA_ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'MFA_ENCRYPTION_KEY must be a 64-char hex string (32 bytes)'),
  UNIVERSITY_NAME: z.string().default('{{university_name}}'),
  UNIVERSITY_SHORT_NAME: z.string().default('{{university_short_name}}'),
  INSTITUTION_DOMAIN: z.string().default('university.edu'),
  SUPPORT_EMAIL: z.string().default('support@university.edu'),
  DEFAULT_CURRENCY: z.string().default('USD'),
  DEFAULT_TIMEZONE: z.string().default('UTC'),
  SECOND_LANGUAGE: z.string().default('ar'),
  GOOGLE_CLIENT_ID: z.string().default('{{google_oauth_client_id}}'),
  GOOGLE_CLIENT_SECRET: z.string().default('{{google_oauth_client_secret}}'),
  MICROSOFT_CLIENT_ID: z.string().default('{{microsoft_oauth_client_id}}'),
  MICROSOFT_CLIENT_SECRET: z.string().default('{{microsoft_oauth_client_secret}}'),
  SSO_REDIRECT_URI: z.string().default('http://localhost:3000/api/auth/sso/callback'),
});

export type ApiEnv = z.infer<typeof envSchema>;

let cachedEnv: ApiEnv | null = null;

export function getEnv(): ApiEnv {
  if (cachedEnv) return cachedEnv;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((i) => `${i.path.join('.')}: ${i.message}`)
      .join('; ');
    throw new Error(`Invalid API environment configuration: ${details}`);
  }
  if (
    parsed.data.ENABLE_LOCAL_NO_REDIS_DEV &&
    (parsed.data.NODE_ENV === 'staging' || parsed.data.NODE_ENV === 'production')
  ) {
    throw new Error('ENABLE_LOCAL_NO_REDIS_DEV cannot be true in staging or production');
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}
