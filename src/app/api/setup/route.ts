import { NextRequest, NextResponse } from "next/server";
import { readUserJSON, writeUserJSON } from "@/lib/fileStore";
import { ChecklistItem } from "@/lib/validation";

export interface InstrumentProfile {
  maxRiskPercent: number;
  checklist: ChecklistItem[];
}

export interface Setup {
  equity: number;
  instruments: Record<string, InstrumentProfile>;
}

function getUsername(req: NextRequest): string | null {
  return req.headers.get("x-username");
}

export async function GET(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const setup = readUserJSON<Setup>(username, "setup.json");
  return NextResponse.json(setup);
}

export async function PUT(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  writeUserJSON(username, "setup.json", body);
  return NextResponse.json({ ok: true });
}
