import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

// ─── Global (dùng cho users.json, default templates) ───────────────────────

export function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// ─── Per-user (setup.json, plans.json riêng mỗi user) ──────────────────────

function userDir(username: string): string {
  return path.join(DATA_DIR, 'users', username);
}

function ensureUserDir(username: string): void {
  const dir = userDir(username);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function readUserJSON<T>(username: string, filename: string): T {
  const filePath = path.join(userDir(username), filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeUserJSON<T>(username: string, filename: string, data: T): void {
  ensureUserDir(username);
  const filePath = path.join(userDir(username), filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

export function userFileExists(username: string, filename: string): boolean {
  return fs.existsSync(path.join(userDir(username), filename));
}
