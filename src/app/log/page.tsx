"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  type: string;
}

interface PlanData {
  instrument: string;
  checklistName: string;
  maxUsd: number;
  checklistItems: ChecklistItem[];
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
      .then((data) => { setPlans(data); setLoading(false); });
  }, []);

  const toggle = (id: string) => setExpanded((prev) => (prev === id ? null : id));

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "0 24px", height: "48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ color: "var(--lime)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>◈ THE GUARDIAN</span>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>NHẬT KÝ</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/plan" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>TERMINAL</Link>
          <Link href="/setup" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>QUY TẮC</Link>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>
            {loading ? "—" : `${plans.length} KẾ HOẠCH`}
          </span>
        </div>
      </header>

      <main style={{ flex: 1, padding: "40px 48px", maxWidth: "800px" }}>
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", margin: "0 0 8px" }}>NHẬT KÝ GIAO DỊCH</p>
          <h1 style={{ color: "var(--text)", fontSize: "22px", fontWeight: "700", margin: 0 }}>Lịch sử kế hoạch đã duyệt</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>Tất cả kế hoạch đã hoàn thành các gate và được lưu lại.</p>
        </div>

        {loading && <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Đang tải...</div>}

        {!loading && plans.length === 0 && (
          <div style={{ border: "1px dashed var(--border)", borderRadius: "6px", padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>📋</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "0 0 20px" }}>Chưa có kế hoạch nào được lưu.</p>
            <Link href="/plan" style={{
              display: "inline-block", background: "var(--lime)", color: "#000",
              padding: "10px 24px", borderRadius: "4px",
              fontSize: "12px", fontWeight: "700", letterSpacing: "0.1em", textDecoration: "none",
            }}>TẠO KẾ HOẠCH ĐẦU TIÊN →</Link>
          </div>
        )}

        {!loading && plans.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {plans.map((plan, index) => {
              const isOpen = expanded === plan.id;
              const date = new Date(plan.createdAt);
              const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
              const timeStr = date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
              const d = plan.data ?? {} as PlanData;

              return (
                <div key={plan.id} style={{
                  border: `1px solid ${isOpen ? "var(--lime-dim)" : "var(--border)"}`,
                  borderRadius: "6px",
                  background: isOpen ? "rgba(163,230,53,0.03)" : "var(--surface)",
                  overflow: "hidden", transition: "border-color 0.2s",
                }}>
                  {/* Header row */}
                  <button onClick={() => toggle(plan.id)} style={{
                    width: "100%", display: "flex", alignItems: "center",
                    gap: "16px", padding: "14px 18px",
                    background: "transparent", border: "none",
                    cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  }}>
                    <span style={{ color: "var(--text-muted)", fontSize: "11px", minWidth: "28px", letterSpacing: "0.05em" }}>
                      #{String(plans.length - index).padStart(2, "0")}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px", minWidth: "120px" }}>
                      {dateStr} · {timeStr}
                    </span>
                    {/* Instrument + checklist name */}
                    <span style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ color: "var(--text)", fontSize: "13px", fontWeight: "700" }}>
                        {d.instrument || "—"}
                      </span>
                      {d.checklistName && (
                        <span style={{
                          fontSize: "11px", color: "var(--lime)",
                          background: "rgba(163,230,53,0.1)",
                          padding: "2px 7px", borderRadius: "3px",
                        }}>
                          {d.checklistName}
                        </span>
                      )}
                    </span>
                    {/* Max USD badge */}
                    {d.maxUsd > 0 && (
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--lime)", minWidth: "60px", textAlign: "right" }}>
                        ${d.maxUsd.toLocaleString("en-US")}
                      </span>
                    )}
                    <span style={{
                      color: "var(--text-muted)", fontSize: "11px",
                      transform: isOpen ? "rotate(90deg)" : "none",
                      transition: "transform 0.2s", marginLeft: "8px",
                    }}>▶</span>
                  </button>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div style={{
                      borderTop: "1px solid var(--border)",
                      padding: "18px 18px 20px 62px",
                      display: "flex", flexDirection: "column", gap: "16px",
                    }}>
                      {/* Meta */}
                      <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                        <Stat label="INSTRUMENT" value={d.instrument || "—"} />
                        <Stat label="BỘ QUY TẮC" value={d.checklistName || "—"} highlight />
                        <Stat label="GIỚI HẠN VỐN" value={d.maxUsd > 0 ? `$${d.maxUsd.toLocaleString("en-US")}` : "—"} />
                      </div>

                      {/* Checklist items */}
                      {d.checklistItems?.length > 0 && (
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--lime)", letterSpacing: "0.15em", marginBottom: "8px", fontWeight: "600" }}>
                            CHECKLIST ({d.checklistItems.length} QUY TẮC ĐÃ PASS)
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {d.checklistItems.map((item) => (
                              <div key={item.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ color: "var(--lime)", fontSize: "11px" }}>✓</span>
                                <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>{item.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
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

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "15px", fontWeight: "700", color: highlight ? "var(--lime)" : "var(--text)" }}>{value}</div>
    </div>
  );
}
