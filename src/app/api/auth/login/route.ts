import { NextResponse } from "next/server";
import { readJSON, readUserJSON, writeUserJSON, userFileExists } from "@/lib/fileStore";

interface User {
  username: string;
  password: string;
}

const DEFAULT_SETUP = {
  equity: 10000,
  instruments: {},
};

const DEFAULT_PLANS: never[] = [];

function initUserDataIfNeeded(username: string): void {
  if (!userFileExists(username, "setup.json")) {
    writeUserJSON(username, "setup.json", DEFAULT_SETUP);
  }
  if (!userFileExists(username, "plans.json")) {
    writeUserJSON(username, "plans.json", DEFAULT_PLANS);
  }
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  const users = readJSON<User[]>("users.json");
  const match = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!match) {
    return NextResponse.json(
      { error: "Sai tên đăng nhập hoặc mật khẩu." },
      { status: 401 }
    );
  }

  // Tạo data riêng cho user nếu chưa có
  initUserDataIfNeeded(match.username);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("tg_session", match.username, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
