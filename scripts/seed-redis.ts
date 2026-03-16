/**
 * scripts/seed-redis.ts
 *
 * Migrate toàn bộ data từ JSON files local lên Upstash Redis.
 * Chạy đúng 1 lần duy nhất trước khi deploy.
 *
 * Cách chạy:
 *   npx tsx scripts/seed-redis.ts
 *
 * Yêu cầu:
 *   - File .env.local phải có UPSTASH_REDIS_REST_URL và UPSTASH_REDIS_REST_TOKEN
 *   - npm install tsx dotenv (nếu chưa có)
 */

import { Redis } from "@upstash/redis";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DATA_DIR = path.resolve(process.cwd(), "src/data");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readLocalJSON<T>(filePath: string): T | null {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function redisKey(username: string, filename: string): string {
  if (filename === "setup.json") return `user:${username}:setup`;
  if (filename === "plans.json") return `user:${username}:plans`;
  throw new Error(`Unknown filename: ${filename}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  // Validate env
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error("❌  Thiếu UPSTASH_REDIS_REST_URL hoặc UPSTASH_REDIS_REST_TOKEN trong .env.local");
    process.exit(1);
  }

  const usersDir = path.join(DATA_DIR, "users");
  const usernames = fs.readdirSync(usersDir).filter((name) => {
    return fs.statSync(path.join(usersDir, name)).isDirectory();
  });

  console.log(`\n🔍  Tìm thấy ${usernames.length} user(s): ${usernames.join(", ")}\n`);

  const overwrite = process.argv.includes("--overwrite");
  if (overwrite) console.log("⚠️   Chế độ --overwrite: sẽ ghi đè key đã tồn tại.\n");

  for (const username of usernames) {
    const userDir = path.join(usersDir, username);

    for (const filename of ["setup.json", "plans.json"] as const) {
      const filePath = path.join(userDir, filename);
      const data = readLocalJSON(filePath);

      if (data === null) {
        console.warn(`  ⚠️  ${username}/${filename} — không đọc được, bỏ qua.`);
        continue;
      }

      const key = redisKey(username, filename);

      // Kiểm tra key đã tồn tại chưa
      const exists = await redis.exists(key);
      if (exists === 1 && !overwrite) {
        console.log(`  ⏭️  ${key} — đã tồn tại, bỏ qua.`);
        continue;
      }

      await redis.set(key, JSON.stringify(data));
      console.log(`  ✅  ${key} — seeded (${JSON.stringify(data).length} bytes)`);
    }
  }

  console.log("\n🎉  Seed hoàn tất!\n");
}

seed().catch((err) => {
  console.error("❌  Lỗi khi seed:", err);
  process.exit(1);
});
