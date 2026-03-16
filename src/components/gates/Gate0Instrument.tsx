"use client";

import { useEffect, useState } from "react";
import { useGuardianStore } from "@/store/guardianStore";
import { Setup } from "@/app/api/setup/route";
import { Checklist } from "@/lib/validation";

export default function Gate0Instrument() {
  const { planData, setPlanData, advance } = useGuardianStore();
  const [setup, setSetup] = useState<Setup | null>(null);
  // instrument đang được expand (để hiện danh sách checklist)
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data: Setup) => {
        setSetup(data);
        // Auto-expand instrument đầu tiên
        const first = Object.keys(data.instruments ?? {})[0];
        if (first) setExpanded(first);
      });
  }, []);

  const handleSelectChecklist = (instrumentName: string, checklist: Checklist, data?: Setup) => {
    const src = data ?? setup;
    if (!src) return;
    setPlanData({
      instrument: instrumentName,
      checklistId: checklist.id,
      checklistName: checklist.name,
      checklistItems: checklist.items,
      checklist: new Array(checklist.items.length).fill(undefined),
      risk: {
        entry: 0,
        stop: 0,
        equity: src.equity,
        riskPercent: 0,
      },
    });
  };

  const toggleExpand = (name: string) => {
    setExpanded((prev) => (prev === name ? null : name));
  };

  const handleConfirm = () => {
    if (planData.instrument && planData.checklistId) advance();
  };

  if (!setup) {
    return <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Đang tải...</div>;
  }

  const instruments = Object.entries(setup.instruments);
  const isReady = planData.instrument.trim().length > 0 && planData.checklistId.trim().length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          CHỌN INSTRUMENT & CHECKLIST
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Hôm nay mày trade gì?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>
          Chọn instrument, sau đó chọn bộ quy tắc phù hợp với loại trade hôm nay.
        </p>
      </div>

      {/* Instrument list */}
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
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {instruments.map(([name, instrument]) => {
            const isThisExpanded = expanded === name;
            const isThisSelected = planData.instrument === name;

            return (
              <div key={name} style={{
                border: `1px solid ${isThisSelected ? "var(--lime)" : "var(--border)"}`,
                borderRadius: "6px",
                background: isThisSelected ? "rgba(163,230,53,0.05)" : "var(--surface)",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}>
                {/* Instrument header row — click để expand */}
                <button
                  onClick={() => toggleExpand(name)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 18px",
                    background: "transparent", border: "none",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {/* Indicator: có checklist nào đang chọn không */}
                    <span style={{
                      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                      background: isThisSelected ? "var(--lime)" : "var(--border)",
                      transition: "background 0.15s",
                    }} />
                    <span style={{
                      fontSize: "15px", fontWeight: "700", letterSpacing: "0.05em",
                      color: isThisSelected ? "var(--lime)" : "var(--text)",
                    }}>
                      {name}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {instrument.checklists.length} bộ quy tắc
                    </span>
                    {isThisSelected && planData.checklistName && (
                      <span style={{
                        fontSize: "11px", color: "var(--lime)",
                        background: "rgba(163,230,53,0.12)",
                        padding: "2px 8px", borderRadius: "3px",
                      }}>
                        {planData.checklistName}
                      </span>
                    )}
                  </div>
                  <span style={{
                    color: "var(--text-muted)", fontSize: "12px",
                    transform: isThisExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                    display: "inline-block",
                  }}>
                    ▾
                  </span>
                </button>

                {/* Checklist options — hiện khi expand */}
                {isThisExpanded && (
                  <div style={{
                    borderTop: "1px solid var(--border)",
                    padding: "8px 12px 12px 12px",
                    display: "flex", flexDirection: "column", gap: "6px",
                  }}>
                    {instrument.checklists.length === 0 ? (
                      <div style={{ fontSize: "12px", color: "var(--text-muted)", padding: "8px 6px" }}>
                        Chưa có checklist nào.{" "}
                        <a href="/setup" style={{ color: "var(--lime)", textDecoration: "none" }}>Vào QUY TẮC để tạo.</a>
                      </div>
                    ) : (
                      instrument.checklists.map((cl) => {
                        const isClSelected = planData.checklistId === cl.id && planData.instrument === name;
                        return (
                          <button
                            key={cl.id}
                            onClick={() => handleSelectChecklist(name, cl)}
                            style={{
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              padding: "10px 14px", borderRadius: "4px",
                              background: isClSelected ? "rgba(163,230,53,0.1)" : "var(--bg)",
                              border: `1px solid ${isClSelected ? "var(--lime)" : "var(--border)"}`,
                              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                              transition: "all 0.15s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {/* Radio dot */}
                              <span style={{
                                width: "14px", height: "14px", borderRadius: "50%", flexShrink: 0,
                                border: `2px solid ${isClSelected ? "var(--lime)" : "var(--border)"}`,
                                background: isClSelected ? "var(--lime)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}>
                                {isClSelected && (
                                  <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#000" }} />
                                )}
                              </span>
                              <span style={{
                                fontSize: "13px", fontWeight: isClSelected ? "700" : "400",
                                color: isClSelected ? "var(--lime)" : "var(--text)",
                              }}>
                                {cl.name}
                              </span>
                              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                {cl.items.length} quy tắc
                              </span>
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--lime)" }}>
                              Max ${cl.maxUsd}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm button */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleConfirm}
          disabled={!isReady}
          style={{
            background: isReady ? "var(--lime)" : "var(--border)",
            color: isReady ? "#000" : "var(--text-muted)",
            border: "none", borderRadius: "4px",
            padding: "10px 28px", fontSize: "12px",
            fontWeight: "700", letterSpacing: "0.1em",
            cursor: isReady ? "pointer" : "not-allowed",
            transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          {isReady
            ? `BẮT ĐẦU — ${planData.instrument} / ${planData.checklistName} →`
            : "CHỌN INSTRUMENT & CHECKLIST"}
        </button>
      </div>
    </div>
  );
}
