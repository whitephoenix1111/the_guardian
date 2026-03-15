"use client";

import { useGuardianStore } from "@/store/guardianStore";
import { useState } from "react";

export default function Gate5Execution() {
  const { planData, goBack, reset } = useGuardianStore();
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const executionCode = [
    `=== THE GUARDIAN — LỆNH ĐƯỢC DUYỆT ===`,
    `Thời gian : ${new Date().toLocaleString("vi-VN")}`,
    `Instrument: ${planData.instrument}`,
    ``,
    `[BỐI CẢNH]`,
    planData.narrative,
    ``,
    `[RỦI RO]`,
    `Vào lệnh : ${planData.risk.entry}`,
    `Stoploss  : ${planData.risk.stop}`,
    `Rủi ro   : ${planData.risk.riskPercent.toFixed(2)}%`,
    ``,
    `[PRE-MORTEM]`,
    planData.preMortem,
    ``,
    `[TRẠNG THÁI] ĐÃ DUYỆT — Thực thi với sự tự tin.`,
  ].join("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(executionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: "APPROVED",
        data: planData,
      }),
    });
    setSaving(false);
    setSaved(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 5 — THỰC THI
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          ✓ Kế hoạch đã được duyệt. Thực thi với sự tự tin.
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
          Mày đã vượt qua tất cả 5 gate. The Guardian cấp phép thực thi.
        </p>
      </div>

      <div style={{
        background: "var(--bg)", border: "1px solid var(--lime-dim)",
        borderRadius: "6px", padding: "16px", fontSize: "12px",
        lineHeight: "1.8", color: "var(--text-muted)",
        whiteSpace: "pre-wrap", fontFamily: "inherit",
        maxHeight: "280px", overflowY: "auto",
      }}>
        {executionCode}
      </div>

      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <button onClick={handleCopy} style={actionBtnStyle("#000", "var(--lime)", "var(--lime)")}>
          {copied ? "✓ ĐÃ SAO CHÉP" : "SAO CHÉP KẾ HOẠCH"}
        </button>
        <button onClick={handleSave} disabled={saving || saved}
          style={actionBtnStyle("var(--lime)", "transparent", "var(--lime-dim)")}>
          {saving ? "ĐANG LƯU..." : saved ? "✓ ĐÃ LƯU" : "LƯU VÀO NHẬT KÝ"}
        </button>
        <button onClick={goBack} style={actionBtnStyle("var(--text-muted)", "transparent", "var(--border)")}>
          ← QUAY LẠI
        </button>
      </div>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
        <button onClick={reset} style={{
          background: "transparent", color: "var(--text-muted)",
          border: "none", fontSize: "12px", cursor: "pointer",
          fontFamily: "inherit", textDecoration: "underline",
        }}>
          Bắt đầu kế hoạch mới →
        </button>
      </div>
    </div>
  );
}

function actionBtnStyle(color: string, bg: string, border?: string): React.CSSProperties {
  return {
    background: bg, color,
    border: `1px solid ${border || bg}`,
    borderRadius: "4px", padding: "10px 20px",
    fontSize: "12px", fontWeight: "700",
    letterSpacing: "0.08em", cursor: "pointer",
    fontFamily: "inherit", transition: "opacity 0.2s",
  };
}
