import { NextRequest, NextResponse } from "next/server";
import { readUserJSON, writeUserJSON } from "@/lib/fileStore";
import { ChecklistItem, Checklist, InstrumentWithChecklists } from "@/lib/validation";

// ── Schema cũ (flat) — dùng khi migrate ──────────────────────────────────

export interface InstrumentProfileLegacy {
  maxRiskPercent: number;
  checklist: ChecklistItem[];
}

export interface SetupLegacy {
  equity: number;
  instruments: Record<string, InstrumentProfileLegacy>;
}

// ── Schema mới (multi-checklist) ─────────────────────────────────────────

export interface Setup {
  equity: number;
  instruments: Record<string, InstrumentWithChecklists>;
}

// ── Migration: schema cũ → mới ───────────────────────────────────────────

function isLegacyInstrument(val: InstrumentProfileLegacy | InstrumentWithChecklists): val is InstrumentProfileLegacy {
  return "checklist" in val && Array.isArray((val as InstrumentProfileLegacy).checklist);
}

export function migrateLegacySetup(raw: SetupLegacy | Setup): Setup {
  const instruments: Record<string, InstrumentWithChecklists> = {};
  for (const [name, profile] of Object.entries(raw.instruments)) {
    if (isLegacyInstrument(profile as InstrumentProfileLegacy | InstrumentWithChecklists)) {
      const legacy = profile as InstrumentProfileLegacy;
      instruments[name] = {
        id: name,
        checklists: [
          {
            id: `${name}-default`,
            name: "Trade thường",
            maxUsd: (legacy as any).maxUsd ?? (legacy as any).maxRiskPercent ?? 100,
            items: legacy.checklist,
          },
        ],
      };
    } else {
      instruments[name] = profile as InstrumentWithChecklists;
    }
  }
  return { equity: raw.equity, instruments };
}

// ── Helpers ───────────────────────────────────────────────────────────────

function getUsername(req: NextRequest): string | null {
  return req.headers.get("x-username");
}

// ── Route handlers ────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const raw = await readUserJSON<SetupLegacy | Setup>(username, "setup.json");
  const setup = migrateLegacySetup(raw as SetupLegacy | Setup);
  return NextResponse.json(setup);
}

export async function PUT(req: NextRequest) {
  const username = getUsername(req);
  if (!username) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await writeUserJSON(username, "setup.json", body);
  return NextResponse.json({ ok: true });
}
