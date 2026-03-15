"use client";

import { useGuardianStore } from "@/store/guardianStore";

const GATE_LABELS = [
  { id: 0, label: "Instrument" },
  { id: 1, label: "Bối cảnh" },
  { id: 2, label: "Checklist" },
  { id: 3, label: "Rủi ro" },
  { id: 4, label: "Pre-Mortem" },
  { id: 5, label: "Thực thi" },
];

const STATUS_ICON: Record<string, string> = {
  done: "✓",
  "in-progress": "►",
  locked: "○",
};

export default function GateProgress() {
  const { currentGate, gateStatus, planData } = useGuardianStore();
  // Progress: gates 1–5 only (gate 0 is pre-flight)
  const doneCount = [1, 2, 3, 4, 5].filter((g) => gateStatus[g] === "done").length;
  const percent = Math.round((doneCount / 5) * 100);

  return (
    <aside style={{
      background: "var(--surface)",
      borderRight: "1px solid var(--border)",
      padding: "24px 16px",
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      minWidth: "180px",
    }}>
      {/* Progress bar */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "6px", letterSpacing: "0.1em" }}>
          TIẾN ĐỘ
        </div>
        <div style={{ background: "var(--border)", height: "4px", borderRadius: "2px" }}>
          <div style={{
            background: "var(--lime)", height: "4px", borderRadius: "2px",
            width: `${percent}%`, transition: "width 0.3s ease",
          }} />
        </div>
        <div style={{ fontSize: "11px", color: "var(--lime)", marginTop: "4px" }}>{percent}%</div>
      </div>

      {/* Instrument badge — shown after gate 0 done */}
      {planData.instrument && gateStatus[0] === "done" && (
        <div style={{
          padding: "6px 10px", marginBottom: "12px",
          background: "rgba(163,230,53,0.08)",
          border: "1px solid var(--lime-dim)",
          borderRadius: "4px",
          fontSize: "12px", fontWeight: "700",
          color: "var(--lime)", letterSpacing: "0.06em",
        }}>
          {planData.instrument}
        </div>
      )}

      {/* Gate list */}
      {GATE_LABELS.map((gate) => {
        const status = gateStatus[gate.id];
        const isActive = gate.id === currentGate;
        // Gate 0 shown differently — it's the pre-flight step
        const isGate0 = gate.id === 0;

        return (
          <div key={gate.id} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "7px 10px", borderRadius: "4px",
            background: isActive ? "rgba(163,230,53,0.08)" : "transparent",
            border: isActive ? "1px solid var(--lime-dim)" : "1px solid transparent",
            opacity: status === "locked" ? 0.35 : 1,
            // Subtle separator between gate 0 and gate 1
            marginBottom: isGate0 ? "8px" : 0,
          }}>
            <span style={{
              color: status === "done" || isActive ? "var(--lime)" : "var(--text-muted)",
              fontSize: "12px", width: "14px",
            }}>
              {STATUS_ICON[status]}
            </span>
            <span style={{ fontSize: "12px", color: isActive ? "var(--text)" : "var(--text-muted)" }}>
              {isGate0 ? gate.label : `${gate.id}. ${gate.label}`}
            </span>
          </div>
        );
      })}
    </aside>
  );
}
