import { Redis } from "@upstash/redis";

// Singleton — đọc từ env UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
// Thêm 2 biến này vào Vercel Dashboard → Settings → Environment Variables
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export default redis;
