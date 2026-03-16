"use client";

import { useState } from "react";
import { useGuardianStore } from "@/store/guardianStore";

export default function Gate3RiskCalc() {
  const { planData, setPlanData, advance, goBack } = useGuardianStore();
  const [usd, setUsd] = useState<string>(planData.maxUsd > 0 ? String(planData.maxUsd) : "");

  const value = parseFloat(usd) || 0;
  const isValid = value > 0;

  const handleAdvance = () => {
    setPlanData({ maxUsd: value });
    advance();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 3 — GIỚI HẠN VỐN
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Mày chấp nhận mất tối đa bao nhiêu?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
          Nhập số USD tối đa mày sẵn sàng bỏ ra cho lệnh này. Đây là cam kết — không phải ước tính.
          {planData.checklistId && (
            <> Giới hạn theo bộ quy tắc <strong style={{ color: "var(--lime)" }}>{planData.checklistName}</strong>. </>
          )}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "24px", color: "var(--text-muted)", fontWeight: "300" }}>$</span>
        <input
          autoFocus
          type="number"
          min="0"
          step="any"
          value={usd}
          onChange={e => setUsd(e.target.value)}
          onKeyDown={e => e.key === "Enter" && isValid && handleAdvance()}
          placeholder="0"
          style={{
            background: "var(--bg)",
            border: `1px solid ${isValid ? "var(--lime-dim)" : "var(--border)"}`,
            borderRadius: "6px", color: "var(--text)",
            fontSize: "32px", fontWeight: "700",
            padding: "14px 18px", outline: "none",
            fontFamily: "inherit", width: "220px",
            transition: "border-color 0.2s",
          }}
        />
        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>USD</span>
      </div>

      {isValid && (
        <div style={{
          padding: "14px 18px", borderRadius: "6px",
          background: "rgba(163,230,53,0.06)",
          border: "1px solid var(--lime-dim)",
          fontSize: "13px", color: "var(--lime)",
        }}>
          ✓ Cam kết tối đa <strong>${value.toLocaleString("en-US")}</strong> cho lệnh {planData.instrument} — {planData.checklistName}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={goBack} style={backBtnStyle}>← QUAY LẠI</button>
        <button
          onClick={handleAdvance}
          disabled={!isValid}
          style={isValid ? nextBtnActiveStyle : nextBtnDisabledStyle}
        >
          TIẾP THEO →
        </button>
      </div>
    </div>
  );
}

const backBtnStyle: React.CSSProperties = {
  background: "transparent", color: "var(--text-muted)",
  border: "1px solid var(--border)", borderRadius: "4px",
  padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
};
const nextBtnActiveStyle: React.CSSProperties = {
  background: "var(--lime)", color: "#000", border: "none",
  borderRadius: "4px", padding: "10px 28px", fontSize: "12px",
  fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit",
};
const nextBtnDisabledStyle: React.CSSProperties = {
  ...nextBtnActiveStyle, background: "var(--border)", color: "var(--text-muted)", cursor: "not-allowed",
};
