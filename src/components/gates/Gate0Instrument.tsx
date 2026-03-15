"use client";

import { useEffect, useState } from "react";
import { useGuardianStore } from "@/store/guardianStore";
import { InstrumentProfile } from "@/app/api/setup/route";

interface Setup {
  equity: number;
  instruments: Record<string, InstrumentProfile>;
}

export default function Gate0Instrument() {
  const { planData, setPlanData, advance } = useGuardianStore();
  const [setup, setSetup] = useState<Setup | null>(null);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data: Setup) => {
        setSetup(data);
        // Pre-select first instrument if none chosen
        if (!planData.instrument && data.instruments) {
          const first = Object.keys(data.instruments)[0];
          if (first) handleSelect(first, data);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelect = (name: string, data?: Setup) => {
    const src = data ?? setup;
    if (!src) return;
    const profile = src.instruments[name];
    if (!profile) return;
    setPlanData({
      instrument: name,
      checklistItems: profile.checklist,
      checklist: new Array(profile.checklist.length).fill(undefined),
      risk: {
        entry: 0,
        stop: 0,
        equity: src.equity,
        riskPercent: 0,
      },
    });
  };

  const handleConfirm = () => {
    if (planData.instrument) advance();
  };

  if (!setup) {
    return (
      <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Đang tải...</div>
    );
  }

  const instruments = Object.entries(setup.instruments);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          CHỌN INSTRUMENT
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Hôm nay mày trade gì?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>
          Mỗi instrument có bộ quy tắc và giới hạn rủi ro riêng. Chọn đúng trước khi bắt đầu.
        </p>
      </div>

      {/* Instrument grid */}
      {instruments.length === 0 ? (
        <div style={{
          border: "1px dashed var(--border)", borderRadius: "6px",
          padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "13px",
        }}>
          Chưa có instrument nào. Vào{" "}
          <a href="/setup" style={{ color: "var(--lime)", textDecoration: "none" }}>QUY TẮC</a>
          {" "}để tạo.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {instruments.map(([name, profile]) => {
            const isSelected = planData.instrument === name;
            return (
              <button
                key={name}
                onClick={() => handleSelect(name)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 20px",
                  background: isSelected ? "rgba(163,230,53,0.07)" : "var(--surface)",
                  border: `1px solid ${isSelected ? "var(--lime)" : "var(--border)"}`,
                  borderRadius: "6px", cursor: "pointer", fontFamily: "inherit",
                  textAlign: "left", transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  {/* Selection indicator */}
                  <span style={{
                    width: "16px", height: "16px", borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--lime)" : "var(--border)"}`,
                    background: isSelected ? "var(--lime)" : "transparent",
                    flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.15s",
                  }}>
                    {isSelected && (
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#000" }} />
                    )}
                  </span>

                  {/* Name */}
                  <span style={{
                    fontSize: "16px", fontWeight: "700",
                    color: isSelected ? "var(--lime)" : "var(--text)",
                    letterSpacing: "0.05em",
                  }}>
                    {name}
                  </span>

                  {/* Rule count */}
                  <span style={{
                    fontSize: "11px", color: "var(--text-muted)",
                    borderLeft: "1px solid var(--border)", paddingLeft: "16px",
                  }}>
                    {profile.checklist.length} quy tắc
                  </span>
                </div>

                {/* Max risk badge */}
                <span style={{
                  fontSize: "12px", fontWeight: "700",
                  color: profile.maxRiskPercent <= 1
                    ? "var(--lime)"
                    : profile.maxRiskPercent <= 2
                    ? "var(--warning)"
                    : "var(--danger)",
                }}>
                  Max {profile.maxRiskPercent}% risk
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Confirm button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleConfirm}
          disabled={!planData.instrument}
          style={{
            background: planData.instrument ? "var(--lime)" : "var(--border)",
            color: planData.instrument ? "#000" : "var(--text-muted)",
            border: "none", borderRadius: "4px",
            padding: "10px 28px", fontSize: "12px",
            fontWeight: "700", letterSpacing: "0.1em",
            cursor: planData.instrument ? "pointer" : "not-allowed",
            transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          BẮT ĐẦU — {planData.instrument || "..."} →
        </button>
      </div>
    </div>
  );
}
