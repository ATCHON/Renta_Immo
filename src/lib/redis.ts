// src/lib/redis.ts — Client Redis partagé Upstash (ARCH-S01 + ARCH-S03)
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
