"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface RiskData {
  entry: number;
  stop: number;
  equity: number;
  riskPercent: number;
}

interface PlanData {
  narrative: string;
  preMortem: string;
  risk: RiskData;
  checklist: (boolean | number | string)[];
}

interface Plan {
  id: string;
  createdAt: string;
  status: string;
  data: PlanData;
}

export default function LogPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => (prev === id ? null : id));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "0 24px", height: "48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--lime)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>
            ◈ THE GUARDIAN
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>NHẬT KÝ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/plan" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            TERMINAL
          </Link>
          <Link href="/setup" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            QUY TẮC
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            {loading ? "—" : `${plans.length} KẾ HOẠCH`}
          </span>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, padding: "40px 48px", maxWidth: "800px" }}>
        {/* Title */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", margin: "0 0 8px" }}>
            NHẬT KÝ GIAO DỊCH
          </p>
          <h1 style={{ color: "var(--text)", fontSize: "22px", fontWeight: "700", margin: 0 }}>
            Lịch sử kế hoạch đã duyệt
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>
            Tất cả kế hoạch đã hoàn thành 5 gate và được lưu lại.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Đang tải...</div>
        )}

        {/* Empty state */}
        {!loading && plans.length === 0 && (
          <div style={{
            border: "1px dashed var(--border)", borderRadius: "6px",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 20px" }}>
              Chưa có kế hoạch nào được lưu.
            </p>
            <Link href="/plan" style={{
              display: "inline-block", background: "var(--lime)", color: "#000",
              padding: "10px 24px", borderRadius: "4px",
              fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em",
              textDecoration: "none",
            }}>
              TẠO KẾ HOẠCH ĐẦU TIÊN →
            </Link>
          </div>
        )}

        {/* Plan list */}
        {!loading && plans.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {plans.map((plan, index) => {
              const isOpen = expanded === plan.id;
              const date = new Date(plan.createdAt);
              const dateStr = date.toLocaleDateString("vi-VN", {
                day: "2-digit", month: "2-digit", year: "numeric",
              });
              const timeStr = date.toLocaleTimeString("vi-VN", {
                hour: "2-digit", minute: "2-digit",
              });
              const narrativePreview = plan.data?.narrative?.slice(0, 120) ?? "";
              const riskPercent = plan.data?.risk?.riskPercent;

              return (
                <div
                  key={plan.id}
                  style={{
                    border: `1px solid ${isOpen ? "var(--lime-dim)" : "var(--border)"}`,
                    borderRadius: "6px",
                    background: isOpen ? "rgba(163,230,53,0.03)" : "var(--surface)",
                    overflow: "hidden",
                    transition: "border-color 0.2s",
                  }}
                >
                  {/* Row header — click to expand */}
                  <button
                    onClick={() => toggle(plan.id)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center",
                      gap: "16px", padding: "14px 18px",
                      background: "transparent", border: "none",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    }}
                  >
                    {/* Index */}
                    <span style={{
                      color: "var(--text-muted)", fontSize: "11px",
                      minWidth: "28px", letterSpacing: "0.05em",
                    }}>
                      #{String(plans.length - index).padStart(2, "0")}
                    </span>

                    {/* Date/time */}
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", minWidth: "120px" }}>
                      {dateStr} · {timeStr}
                    </span>

                    {/* Narrative preview */}
                    <span style={{
                      flex: 1, color: "var(--text)", fontSize: "13px",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {narrativePreview}
                    </span>

                    {/* Risk badge */}
                    {riskPercent != null && (
                      <span style={{
                        fontSize: "11px", fontWeight: "700",
                        color: riskPercent <= 1
                          ? "var(--lime)"
                          : riskPercent <= 2
                          ? "var(--warning)"
                          : "var(--danger)",
                        minWidth: "48px", textAlign: "right",
                      }}>
                        {riskPercent.toFixed(2)}%
                      </span>
                    )}

                    {/* Chevron */}
                    <span style={{
                      color: "var(--text-muted)", fontSize: "11px",
                      transform: isOpen ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s", marginLeft: "8px",
                    }}>
                      ▶
                    </span>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{
                      borderTop: "1px solid var(--border)",
                      padding: "18px 18px 20px 58px",
                      display: "flex", flexDirection: "column", gap: "18px",
                    }}>
                      {/* Narrative */}
                      <Section label="BỐI CẢNH THỊ TRƯỜNG">
                        <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                          {plan.data.narrative}
                        </p>
                      </Section>

                      {/* Risk */}
                      {plan.data.risk && (
                        <Section label="RỦI RO">
                          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                            <Stat label="VÀO LỆNH" value={String(plan.data.risk.entry)} />
                            <Stat label="STOPLOSS" value={String(plan.data.risk.stop)} />
                            <Stat
                              label="VỐN"
                              value={plan.data.risk.equity.toLocaleString("vi-VN")}
                            />
                            <Stat
                              label="RỦI RO / LỆNH"
                              value={`${plan.data.risk.riskPercent.toFixed(2)}%`}
                              highlight
                            />
                          </div>
                        </Section>
                      )}

                      {/* Pre-mortem */}
                      {plan.data.preMortem && (
                        <Section label="PRE-MORTEM">
                          <p style={{ color: "var(--text)", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                            {plan.data.preMortem}
                          </p>
                        </Section>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ── */

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: "10px", color: "var(--lime)", letterSpacing: "0.15em",
        marginBottom: "6px", fontWeight: "600",
      }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontSize: "10px", color: "var(--text-muted)",
        letterSpacing: "0.1em", marginBottom: "2px",
      }}>
        {label}
      </div>
      <div style={{
        fontSize: "15px", fontWeight: "700",
        color: highlight ? "var(--lime)" : "var(--text)",
      }}>
        {value}
      </div>
    </div>
  );
}
