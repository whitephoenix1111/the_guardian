"use client";

import { useGuardianStore } from "@/store/guardianStore";
import { validateGate3, calcRiskPercent } from "@/lib/validation";
import { useState, useEffect } from "react";

export default function Gate3RiskCalc() {
  const { planData, setPlanData, advance, goBack } = useGuardianStore();
  const [entry, setEntry] = useState(planData.risk.entry || 0);
  const [stop, setStop] = useState(planData.risk.stop || 0);
  const [equity, setEquity] = useState(planData.risk.equity || 0);
  const [lotSize, setLotSize] = useState(1);
  const [maxRisk, setMaxRisk] = useState(1.0);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        setMaxRisk(data.maxRiskPercent ?? 1.0);
        if (!planData.risk.equity && data.equity) {
          setEquity(data.equity);
        }
      });
  }, []);

  const riskPercent = calcRiskPercent(entry, stop, equity, lotSize);
  const isValid = validateGate3(riskPercent, maxRisk);
  const isTooHigh = riskPercent > maxRisk && equity > 0;

  const handleUpdate = () => {
    setPlanData({ risk: { entry, stop, equity, riskPercent } });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 3 — TÍNH TOÁN RỦI RO
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Con số nói gì?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
          Rủi ro tối đa cho phép: <span style={{ color: "var(--lime)" }}>{maxRisk}% vốn</span>. Vượt quá sẽ bị chặn.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {[
          { label: "GIÁ VÀO LỆNH", value: entry, setter: setEntry },
          { label: "STOPLOSS", value: stop, setter: setStop },
          { label: "VỐN TÀI KHOẢN ($)", value: equity, setter: setEquity },
          { label: "KHỐI LƯỢNG (LOT)", value: lotSize, setter: setLotSize },
        ].map(({ label, value, setter }) => (
          <div key={label}>
            <label style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", display: "block", marginBottom: "6px" }}>
              {label}
            </label>
            <input
              type="number"
              value={value || ""}
              onChange={(e) => { setter(parseFloat(e.target.value) || 0); handleUpdate(); }}
              style={{
                width: "100%", background: "var(--bg)",
                border: "1px solid var(--border)", borderRadius: "4px",
                color: "var(--text)", fontSize: "14px",
                padding: "10px 12px", outline: "none", fontFamily: "inherit",
              }}
            />
          </div>
        ))}
      </div>

      {equity > 0 && (
        <div style={{
          padding: "16px", borderRadius: "6px",
          background: isTooHigh ? "rgba(239,68,68,0.08)" : "rgba(163,230,53,0.06)",
          border: `1px solid ${isTooHigh ? "var(--danger)" : "var(--lime-dim)"}`,
        }}>
          <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "6px" }}>
            RỦI RO TÍNH TOÁN
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700", color: isTooHigh ? "var(--danger)" : "var(--lime)" }}>
            {riskPercent.toFixed(2)}%
          </div>
          {isTooHigh && (
            <div style={{ fontSize: "12px", color: "var(--danger)", marginTop: "8px" }}>
              ⛔ Rủi ro quá cao — giảm khối lượng hoặc nới stoploss để tiếp tục
            </div>
          )}
          {!isTooHigh && riskPercent > 0 && (
            <div style={{ fontSize: "12px", color: "var(--lime)", marginTop: "8px" }}>
              ✓ Trong ngưỡng cho phép
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={goBack} style={backBtnStyle}>← QUAY LẠI</button>
        <button
          onClick={() => { handleUpdate(); advance(); }}
          disabled={!isValid || equity === 0}
          style={(isValid && equity > 0) ? nextBtnActiveStyle : nextBtnDisabledStyle}
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
