"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChecklistItem, ChecklistItemType } from "@/lib/validation";
import { InstrumentProfile } from "@/app/api/setup/route";

interface Setup {
  equity: number;
  instruments: Record<string, InstrumentProfile>;
}

const TYPE_LABELS: Record<ChecklistItemType, string> = {
  checkbox: "✓ Checkbox",
  number:   "# Number",
  select:   "≡ Select",
};

const BLANK_ITEM = (): Omit<ChecklistItem, "id"> => ({
  label: "", type: "checkbox", operator: ">=", threshold: undefined, options: [],
});

const BLANK_PROFILE = (): InstrumentProfile => ({
  maxRiskPercent: 1,
  checklist: [],
});

export default function SetupPage() {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [activeInstrument, setActiveInstrument] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // New instrument name input
  const [newInstrumentName, setNewInstrumentName] = useState("");
  const [showAddInstrument, setShowAddInstrument] = useState(false);

  // New checklist item draft
  const [draft, setDraft] = useState(BLANK_ITEM());
  const [newOption, setNewOption] = useState("");

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data: Setup) => {
        setSetup(data);
        const first = Object.keys(data.instruments ?? {})[0] ?? null;
        setActiveInstrument(first);
      });
  }, []);

  const save = async (updated: Setup) => {
    setSaving(true); setSaved(false);
    await fetch("/api/setup", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Equity ──────────────────────────────────────────────────────────────
  const saveEquity = (val: number) => {
    if (!setup) return;
    const updated = { ...setup, equity: val };
    setSetup(updated);
    save(updated);
  };

  // ── Instruments ─────────────────────────────────────────────────────────
  const addInstrument = () => {
    const name = newInstrumentName.trim().toUpperCase();
    if (!name || !setup || setup.instruments[name]) return;
    const updated: Setup = {
      ...setup,
      instruments: { ...setup.instruments, [name]: BLANK_PROFILE() },
    };
    setSetup(updated);
    setActiveInstrument(name);
    setNewInstrumentName("");
    setShowAddInstrument(false);
    save(updated);
  };

  const removeInstrument = (name: string) => {
    if (!setup) return;
    const { [name]: _, ...rest } = setup.instruments;
    const updated: Setup = { ...setup, instruments: rest };
    setSetup(updated);
    const remaining = Object.keys(rest);
    setActiveInstrument(remaining[0] ?? null);
    save(updated);
  };

  const saveMaxRisk = (val: number) => {
    if (!setup || !activeInstrument) return;
    const updated: Setup = {
      ...setup,
      instruments: {
        ...setup.instruments,
        [activeInstrument]: { ...setup.instruments[activeInstrument], maxRiskPercent: val },
      },
    };
    setSetup(updated);
    save(updated);
  };

  // ── Checklist items ──────────────────────────────────────────────────────
  const addItem = () => {
    if (!draft.label.trim() || !setup || !activeInstrument) return;
    const newItem: ChecklistItem = {
      ...draft,
      id: String(Date.now()),
      label: draft.label.trim(),
      threshold: draft.type === "number" ? draft.threshold : undefined,
      operator:  draft.type === "number" ? draft.operator  : undefined,
      options:   draft.type === "select" ? draft.options   : undefined,
    };
    const profile = setup.instruments[activeInstrument];
    const updated: Setup = {
      ...setup,
      instruments: {
        ...setup.instruments,
        [activeInstrument]: { ...profile, checklist: [...profile.checklist, newItem] },
      },
    };
    setSetup(updated);
    setDraft(BLANK_ITEM());
    setNewOption("");
    save(updated);
  };

  const removeItem = (id: string) => {
    if (!setup || !activeInstrument) return;
    const profile = setup.instruments[activeInstrument];
    const updated: Setup = {
      ...setup,
      instruments: {
        ...setup.instruments,
        [activeInstrument]: { ...profile, checklist: profile.checklist.filter((i) => i.id !== id) },
      },
    };
    setSetup(updated);
    save(updated);
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setDraft((d) => ({ ...d, options: [...(d.options ?? []), newOption.trim()] }));
    setNewOption("");
  };

  const removeOption = (opt: string) =>
    setDraft((d) => ({ ...d, options: (d.options ?? []).filter((o) => o !== opt) }));

  // ── Render ───────────────────────────────────────────────────────────────
  if (!setup) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
        <span style={{ color: "var(--text-muted)", fontSize: "12px", letterSpacing: "0.1em" }}>LOADING...</span>
      </div>
    );
  }

  const instruments = Object.entries(setup.instruments);
  const profile = activeInstrument ? setup.instruments[activeInstrument] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)", padding: "0 24px", height: "48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "var(--surface)", flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/plan" style={{ textDecoration: "none" }}>
            <span style={{ color: "var(--lime)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>
              ◈ THE GUARDIAN
            </span>
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>/ QUY TẮC</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/plan" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            ← TERMINAL
          </Link>
          <Link href="/log" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
            NHẬT KÝ
          </Link>
          {saving && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>ĐANG LƯU...</span>}
          {saved  && <span style={{ color: "var(--lime)",       fontSize: "11px" }}>ĐÃ LƯU ✓</span>}
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Instrument sidebar ─────────────────────────────────────── */}
        <aside style={{
          background: "var(--surface)", borderRight: "1px solid var(--border)",
          width: "200px", flexShrink: 0, display: "flex", flexDirection: "column",
          padding: "20px 12px", gap: "6px", overflowY: "auto",
        }}>
          {/* Equity — global setting at top of sidebar */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "6px" }}>
              VỐN TÀI KHOẢN
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>$</span>
              <input
                type="number"
                defaultValue={setup.equity}
                onBlur={e => saveEquity(parseFloat(e.target.value) || 0)}
                onKeyDown={e => e.key === "Enter" && saveEquity(parseFloat((e.target as HTMLInputElement).value) || 0)}
                style={{
                  ...inputStyle,
                  width: "100%", fontSize: "12px", padding: "6px 8px",
                }}
              />
            </div>
          </div>

          {/* Instruments list label */}
          <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "4px" }}>
            INSTRUMENTS
          </div>

          {instruments.map(([name]) => {
            const isActive = name === activeInstrument;
            return (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => { setActiveInstrument(name); setDraft(BLANK_ITEM()); }}
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: "4px",
                    background: isActive ? "rgba(163,230,53,0.1)" : "transparent",
                    border: `1px solid ${isActive ? "var(--lime-dim)" : "transparent"}`,
                    color: isActive ? "var(--lime)" : "var(--text-muted)",
                    fontSize: "13px", fontWeight: isActive ? "700" : "400",
                    cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                    letterSpacing: "0.04em", transition: "all 0.15s",
                  }}
                >
                  {name}
                </button>
                <button
                  onClick={() => removeInstrument(name)}
                  title="Xóa instrument"
                  style={{
                    background: "none", border: "none", color: "var(--border)",
                    cursor: "pointer", fontSize: "15px", padding: "0 4px", lineHeight: 1,
                    transition: "color 0.15s", flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--border)")}
                >
                  ×
                </button>
              </div>
            );
          })}

          {/* Add instrument */}
          {showAddInstrument ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
              <input
                autoFocus
                type="text"
                value={newInstrumentName}
                onChange={e => setNewInstrumentName(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") addInstrument(); if (e.key === "Escape") setShowAddInstrument(false); }}
                placeholder="VD: GBP/JPY"
                style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px", width: "100%" }}
              />
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={addInstrument} style={{
                  flex: 1, background: "var(--lime)", color: "#000", border: "none",
                  borderRadius: "3px", padding: "6px 0", fontSize: "11px",
                  fontWeight: "700", cursor: "pointer", fontFamily: "inherit",
                }}>
                  ADD
                </button>
                <button onClick={() => { setShowAddInstrument(false); setNewInstrumentName(""); }} style={{
                  background: "none", border: "1px solid var(--border)", color: "var(--text-muted)",
                  borderRadius: "3px", padding: "6px 8px", fontSize: "11px",
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddInstrument(true)}
              style={{
                marginTop: "6px", padding: "7px 10px", borderRadius: "4px",
                background: "transparent", border: "1px dashed var(--border)",
                color: "var(--text-muted)", fontSize: "12px",
                cursor: "pointer", fontFamily: "inherit", textAlign: "left",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime-dim)"; e.currentTarget.style.color = "var(--lime)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
            >
              + Thêm instrument
            </button>
          )}
        </aside>

        {/* ── Main edit area ─────────────────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          {!activeInstrument || !profile ? (
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>
              Chọn hoặc thêm instrument để cấu hình.
            </div>
          ) : (
            <div style={{ maxWidth: "620px" }}>

              {/* Instrument title */}
              <div style={{ marginBottom: "36px" }}>
                <h1 style={{ color: "var(--lime)", fontSize: "20px", fontWeight: "700", letterSpacing: "0.06em", margin: 0 }}>
                  {activeInstrument}
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
                  {profile.checklist.length} quy tắc · Max risk {profile.maxRiskPercent}%
                </p>
              </div>

              {/* Max Risk */}
              <section style={{ marginBottom: "40px" }}>
                <SectionLabel>RỦI RO TỐI ĐA MỖI LỆNH</SectionLabel>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <input
                    type="number" min="0.1" max="100" step="0.1"
                    defaultValue={profile.maxRiskPercent}
                    key={`${activeInstrument}-risk`}
                    onBlur={e => saveMaxRisk(parseFloat(e.target.value) || 1)}
                    onKeyDown={e => e.key === "Enter" && saveMaxRisk(parseFloat((e.target as HTMLInputElement).value) || 1)}
                    style={{ ...inputStyle, width: "90px" }}
                  />
                  <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>% of equity</span>
                  {profile.maxRiskPercent > 2 && (
                    <span style={{ color: "var(--warning)", fontSize: "11px" }}>⚠ RỦI RO CAO</span>
                  )}
                </div>
              </section>

              {/* Checklist */}
              <section>
                <SectionLabel>CHECKLIST GATE 2</SectionLabel>

                {/* Existing rules */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "24px" }}>
                  {profile.checklist.length === 0 && (
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", padding: "8px 0" }}>
                      Chưa có quy tắc nào.
                    </div>
                  )}
                  {profile.checklist.map((item, idx) => (
                    <div key={item.id} style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "10px 14px", background: "var(--surface)",
                      border: "1px solid var(--border)", borderRadius: "4px",
                    }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "11px", width: "18px" }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span style={{
                        fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px",
                        borderRadius: "3px", background: "var(--bg)",
                        color: "var(--lime)", border: "1px solid var(--lime-dim)", flexShrink: 0,
                      }}>
                        {item.type.toUpperCase()}
                      </span>
                      <span style={{ flex: 1, fontSize: "13px", color: "var(--text)" }}>
                        {item.label}
                        {item.type === "number" && item.threshold !== undefined && (
                          <span style={{ color: "var(--text-muted)", fontSize: "11px", marginLeft: "8px" }}>
                            ({item.operator ?? ">="} {item.threshold})
                          </span>
                        )}
                        {item.type === "select" && item.options?.length ? (
                          <span style={{ color: "var(--text-muted)", fontSize: "11px", marginLeft: "8px" }}>
                            [{item.options.join(", ")}]
                          </span>
                        ) : null}
                      </span>
                      <button onClick={() => removeItem(item.id)} style={removeBtnStyle}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add rule form */}
                <div style={{
                  background: "var(--surface)", border: "1px solid var(--border)",
                  borderRadius: "6px", padding: "20px",
                  display: "flex", flexDirection: "column", gap: "14px",
                }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>QUY TẮC MỚI</div>

                  <div>
                    <FieldLabel>Mô tả quy tắc</FieldLabel>
                    <input
                      type="text" value={draft.label}
                      onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addItem()}
                      placeholder="VD: Volume trên 1.5x mức nền"
                      style={{ ...inputStyle, width: "100%" }}
                    />
                  </div>

                  <div>
                    <FieldLabel>Loại</FieldLabel>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {(["checkbox", "number", "select"] as ChecklistItemType[]).map(t => (
                        <button key={t} onClick={() => setDraft(d => ({ ...d, type: t }))} style={{
                          padding: "6px 14px", borderRadius: "4px", fontSize: "12px",
                          cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.06em",
                          background: draft.type === t ? "var(--lime)" : "var(--bg)",
                          color: draft.type === t ? "#000" : "var(--text-muted)",
                          border: `1px solid ${draft.type === t ? "var(--lime)" : "var(--border)"}`,
                          fontWeight: draft.type === t ? "700" : "400",
                          transition: "all 0.15s",
                        }}>
                          {TYPE_LABELS[t]}
                        </button>
                      ))}
                    </div>
                  </div>

                  {draft.type === "number" && (
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                      <div>
                        <FieldLabel>Điều kiện pass</FieldLabel>
                        <select value={draft.operator}
                          onChange={e => setDraft(d => ({ ...d, operator: e.target.value as ">=" | "<=" }))}
                          style={{ ...inputStyle, width: "130px" }}>
                          <option value=">=">≥ (tối thiểu)</option>
                          <option value="<=">≤ (tối đa)</option>
                        </select>
                      </div>
                      <div>
                        <FieldLabel>Ngưỡng</FieldLabel>
                        <input type="number" step="any"
                          value={draft.threshold ?? ""}
                          onChange={e => setDraft(d => ({ ...d, threshold: parseFloat(e.target.value) || undefined }))}
                          placeholder="e.g. 1.5"
                          style={{ ...inputStyle, width: "100px" }}
                        />
                      </div>
                    </div>
                  )}

                  {draft.type === "select" && (
                    <div>
                      <FieldLabel>Các lựa chọn</FieldLabel>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "8px" }}>
                        {(draft.options ?? []).map(opt => (
                          <span key={opt} style={{
                            display: "flex", alignItems: "center", gap: "6px",
                            padding: "3px 10px", background: "var(--bg)",
                            border: "1px solid var(--border)", borderRadius: "3px",
                            fontSize: "12px", color: "var(--text)",
                          }}>
                            {opt}
                            <button onClick={() => removeOption(opt)} style={{
                              background: "none", border: "none", color: "var(--text-muted)",
                              cursor: "pointer", padding: 0, fontSize: "13px", lineHeight: 1,
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input type="text" value={newOption}
                          onChange={e => setNewOption(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addOption()}
                          placeholder="Thêm lựa chọn..."
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button onClick={addOption} style={addOptBtnStyle}>ADD</button>
                      </div>
                    </div>
                  )}

                  <button onClick={addItem} disabled={!draft.label.trim()} style={{
                    alignSelf: "flex-start",
                    background: draft.label.trim() ? "var(--lime)" : "var(--border)",
                    color: draft.label.trim() ? "#000" : "var(--text-muted)",
                    border: "none", borderRadius: "4px",
                    padding: "9px 22px", fontSize: "12px", fontWeight: "700",
                    letterSpacing: "0.08em",
                    cursor: draft.label.trim() ? "pointer" : "default",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}>
                    + THÊM QUY TẮC
                  </button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "16px" }}>
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "6px" }}>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px",
  padding: "8px 12px", color: "var(--text)", fontSize: "13px",
  outline: "none", fontFamily: "inherit",
};

const removeBtnStyle: React.CSSProperties = {
  background: "none", border: "none", color: "var(--text-muted)",
  cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1,
  transition: "color 0.15s",
};

const addOptBtnStyle: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px",
  color: "var(--text-muted)", fontSize: "11px", fontWeight: "700",
  letterSpacing: "0.08em", padding: "8px 14px", cursor: "pointer", fontFamily: "inherit",
};
