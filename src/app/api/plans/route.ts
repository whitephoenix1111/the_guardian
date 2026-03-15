import { NextRequest, NextResponse } from "next/server";
import { readUserJSON, writeUserJSON } from "@/lib/fileStore";

interface Plan {
  id: string;
  createdAt: string;
  status: string;
  data: object;
}

function getUsername(req: NextRequest): string | null {
  return req.headers.get("x-username");
}

export async function GET(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plans = readUserJSON<Plan[]>(username, "plans.json");
  return NextResponse.json(plans);
}

export async function POST(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const plans = readUserJSON<Plan[]>(username, "plans.json");
  plans.unshift(body);
  writeUserJSON(username, "plans.json", plans);
  return NextResponse.json({ ok: true });
}
