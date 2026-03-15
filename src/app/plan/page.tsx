"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGuardianStore } from "@/store/guardianStore";
import GateProgress from "@/components/layout/GateProgress";
import MentorBar from "@/components/layout/MentorBar";
import Gate0Instrument from "@/components/gates/Gate0Instrument";
import Gate1Narrative from "@/components/gates/Gate1Narrative";
import Gate2Checklist from "@/components/gates/Gate2Checklist";
import Gate3RiskCalc from "@/components/gates/Gate3RiskCalc";
import Gate4PreMortem from "@/components/gates/Gate4PreMortem";
import Gate5Execution from "@/components/gates/Gate5Execution";

const GATE_COMPONENTS = [
  Gate0Instrument,
  Gate1Narrative,
  Gate2Checklist,
  Gate3RiskCalc,
  Gate4PreMortem,
  Gate5Execution,
];

export default function PlanPage() {
  const { currentGate } = useGuardianStore();
  const ActiveGate = GATE_COMPONENTS[currentGate];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "0 24px", height: "48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--lime)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>
            ◈ THE GUARDIAN
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>TERMINAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/setup" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            QUY TẮC
          </Link>
          <Link href="/log" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            NHẬT KÝ
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            {currentGate === 0 ? "INSTRUMENT" : `GATE ${currentGate} / 5`}
          </span>
          <LogoutButton />
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <GateProgress />
        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto", maxWidth: "720px" }}>
          {ActiveGate && <ActiveGate />}
        </main>
      </div>

      <MentorBar />
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  const reset = useGuardianStore((s) => s.reset);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    reset();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      style={{
        background: "none", border: "1px solid var(--border)",
        color: "var(--text-muted)", borderRadius: "3px",
        padding: "3px 10px", fontSize: "10px",
        letterSpacing: "0.08em", cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--danger)"; e.currentTarget.style.color = "var(--danger)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
    >
      ĐĂNG XUẤT
    </button>
  );
}
