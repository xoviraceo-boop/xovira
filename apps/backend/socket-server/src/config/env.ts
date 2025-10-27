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
});

export const env = envSchema.parse(process.env);

export default env;