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

async function initUserDataIfNeeded(username: string): Promise<void> {
  if (!(await userFileExists(username, "setup.json"))) {
    await writeUserJSON(username, "setup.json", DEFAULT_SETUP);
  }
  if (!(await userFileExists(username, "plans.json"))) {
    await writeUserJSON(username, "plans.json", DEFAULT_PLANS);
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

  await initUserDataIfNeeded(match.username);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("tg_session", match.username, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  return res;
}
