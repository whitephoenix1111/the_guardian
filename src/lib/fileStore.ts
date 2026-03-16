/**
 * fileStore.ts — Redis-backed storage (Upstash)
 *
 * Thay thế hoàn toàn fs-based implementation để tương thích Vercel serverless.
 * Interface giữ nguyên, chỉ thêm async cho các hàm per-user.
 *
 * Key convention:
 *   user:{username}:setup   → SetupJSON string
 *   user:{username}:plans   → PlansJSON string
 */

import redis from "@/lib/redis";

// ─── users.json — static, bundle lúc build (read-only là OK) ───────────────
// Import trực tiếp, không cần Redis. Chỉ dùng để đọc danh sách tài khoản.
import usersData from "@/data/users.json";

export function readJSON<T>(filename: string): T {
  if (filename === "users.json") {
    return usersData as unknown as T;
  }
  throw new Error(`readJSON: file "${filename}" không được hỗ trợ qua Redis store.`);
}

// ─── Per-user helpers ───────────────────────────────────────────────────────

function setupKey(username: string) {
  return `user:${username}:setup`;
}

function plansKey(username: string) {
  return `user:${username}:plans`;
}

function keyFor(username: string, filename: string): string {
  if (filename === "setup.json") return setupKey(username);
  if (filename === "plans.json") return plansKey(username);
  throw new Error(`keyFor: unknown filename "${filename}"`);
}

// ─── Public API (async) ─────────────────────────────────────────────────────

export async function readUserJSON<T>(username: string, filename: string): Promise<T> {
  const key = keyFor(username, filename);
  const value = await redis.get<T>(key);
  if (value === null) {
    throw new Error(`readUserJSON: key "${key}" không tồn tại trong Redis.`);
  }
  return value;
}

export async function writeUserJSON<T>(username: string, filename: string, data: T): Promise<void> {
  const key = keyFor(username, filename);
  await redis.set(key, JSON.stringify(data));
}

export async function userFileExists(username: string, filename: string): Promise<boolean> {
  const key = keyFor(username, filename);
  const exists = await redis.exists(key);
  return exists === 1;
}
