import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Redis (Upstash)
  REDIS_URL: z.string(),
  
  // Supabase
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  
  // CORS
  CORS_ORIGIN: z.string().default('*'),
  
  // Security
  JWT_SECRET: z.string().optional(),
  
  // OpenAI for embeddings
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  EMBEDDING_MODEL: z.string().default('text-embedding-3-large'),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  
  // Matching system
  MATCHING_INTERVAL_DAYS: z.string().default('3'),
  MATCHING_SCORE_THRESHOLD: z.string().default('0.85'),
  DATABASE_URL: z.string(),
});

export const env = envSchema.parse(process.env);

export default env;