"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Setup, Checklist, ChecklistItem, BLANK_CHECKLIST, BLANK_ITEM } from "./setup.types";
import SetupSidebar from "./SetupSidebar";
import ChecklistTabs from "./ChecklistTabs";
import ChecklistEditor from "./ChecklistEditor";

export default function SetupPage() {
  const [setup, setSetup] = useState<Setup | null>(null);
  const [activeInstrument, setActiveInstrument] = useState<string | null>(null);
  const [activeChecklistIdx, setActiveChecklistIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/setup").then(r => r.json()).then((data: Setup) => {
      setSetup(data);
      setActiveInstrument(Object.keys(data.instruments ?? {})[0] ?? null);
      setActiveChecklistIdx(0);
    });
  }, []);

  const persist = async (updated: Setup) => {
    setSaving(true); setSaved(false);
    await fetch("/api/setup", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getChecklists = (): Checklist[] => {
    if (!setup || !activeInstrument) return [];
    return setup.instruments[activeInstrument]?.checklists ?? [];
  };

  const applyChecklists = (cls: Checklist[], src?: Setup): Setup => {
    const base = src ?? setup!;
    return { ...base, instruments: { ...base.instruments, [activeInstrument!]: { ...base.instruments[activeInstrument!], checklists: cls } } };
  };

  // ── handlers ───────────────────────────────────────────────
  const handleSelectInstrument = (name: string) => { setActiveInstrument(name); setActiveChecklistIdx(0); };

  const handleAddInstrument = (name: string) => {
    if (!setup) return;
    const updated: Setup = { ...setup, instruments: { ...setup.instruments, [name]: { id: name, checklists: [] } } };
    setSetup(updated); setActiveInstrument(name); setActiveChecklistIdx(0); persist(updated);
  };

  const handleRemoveInstrument = (name: string) => {
    if (!setup) return;
    const { [name]: _, ...rest } = setup.instruments;
    const updated: Setup = { ...setup, instruments: rest };
    setSetup(updated); setActiveInstrument(Object.keys(rest)[0] ?? null); setActiveChecklistIdx(0); persist(updated);
  };

  const handleSaveEquity = (val: number) => {
    if (!setup) return;
    const updated = { ...setup, equity: val };
    setSetup(updated); persist(updated);
  };

  const handleAddChecklist = (name: string) => {
    if (!setup || !activeInstrument) return;
    const newCl: Checklist = { ...BLANK_CHECKLIST(activeInstrument), name };
    const cls = [...getChecklists(), newCl];
    const updated = applyChecklists(cls);
    setSetup(updated); setActiveChecklistIdx(cls.length - 1); persist(updated);
  };

  const handleRemoveChecklist = (idx: number) => {
    const cls = getChecklists().filter((_, i) => i !== idx);
    const updated = applyChecklists(cls);
    setSetup(updated); setActiveChecklistIdx(Math.max(0, idx - 1)); persist(updated);
  };

  const handleSaveChecklistField = (idx: number, field: keyof Checklist, val: unknown) => {
    const cls = getChecklists().map((cl, i) => i === idx ? { ...cl, [field]: val } : cl);
    const updated = applyChecklists(cls);
    setSetup(updated); persist(updated);
  };

  const handleAddItem = (item: ChecklistItem) => {
    const cls = getChecklists().map((c, i) => i === activeChecklistIdx ? { ...c, items: [...c.items, item] } : c);
    const updated = applyChecklists(cls);
    setSetup(updated); persist(updated);
  };

  const handleReorderItems = (newItems: ChecklistItem[]) => {
    const cls = getChecklists().map((c, i) => i === activeChecklistIdx ? { ...c, items: newItems } : c);
    const upd = applyChecklists(cls);
    setSetup(upd); persist(upd);
  };

  const handleEditItem = (itemId: string, updated: ChecklistItem) => {
    const cls = getChecklists().map((c, i) => i === activeChecklistIdx
      ? { ...c, items: c.items.map(it => it.id === itemId ? updated : it) }
      : c
    );
    const upd = applyChecklists(cls);
    setSetup(upd); persist(upd);
  };

  const handleRemoveItem = (itemId: string) => {
    const cls = getChecklists().map((c, i) => i === activeChecklistIdx ? { ...c, items: c.items.filter(it => it.id !== itemId) } : c);
    const updated = applyChecklists(cls);
    setSetup(updated); persist(updated);
  };

  // ── render ──────────────────────────────────────────────────
  if (!setup) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
      <span style={{ color: "var(--text-muted)", fontSize: "12px", letterSpacing: "0.1em" }}>LOADING...</span>
    </div>
  );

  const checklists = getChecklists();
  const activeChecklist = checklists[activeChecklistIdx] ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--border)", padding: "0 24px", height: "48px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--surface)", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link href="/plan" style={{ textDecoration: "none" }}>
            <span style={{ color: "var(--lime)", fontSize: "14px", fontWeight: "700", letterSpacing: "0.1em" }}>◈ THE GUARDIAN</span>
          </Link>
          <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>/ QUY TẮC</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Link href="/plan" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>← TERMINAL</Link>
          <Link href="/log" style={{ color: "var(--text-muted)", fontSize: "11px", textDecoration: "none", letterSpacing: "0.08em" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>NHẬT KÝ</Link>
          {saving && <span style={{ color: "var(--text-muted)", fontSize: "11px" }}>ĐANG LƯU...</span>}
          {saved  && <span style={{ color: "var(--lime)",       fontSize: "11px" }}>ĐÃ LƯU ✓</span>}
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <SetupSidebar
          setup={setup}
          activeInstrument={activeInstrument}
          onSelectInstrument={handleSelectInstrument}
          onAddInstrument={handleAddInstrument}
          onRemoveInstrument={handleRemoveInstrument}
          onSaveEquity={handleSaveEquity}
        />

        <main style={{ flex: 1, overflowY: "auto", padding: "40px 48px" }}>
          {!activeInstrument ? (
            <div style={{ color: "var(--text-muted)", fontSize: "13px" }}>Chọn hoặc thêm instrument để cấu hình.</div>
          ) : (
            <div style={{ maxWidth: "680px" }}>
              <div style={{ marginBottom: "32px" }}>
                <h1 style={{ color: "var(--lime)", fontSize: "20px", fontWeight: "700", letterSpacing: "0.06em", margin: 0 }}>{activeInstrument}</h1>
                <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>{checklists.length} bộ quy tắc</p>
              </div>

              <ChecklistTabs
                checklists={checklists}
                activeIdx={activeChecklistIdx}
                onSelect={idx => { setActiveChecklistIdx(idx); }}
                onAdd={handleAddChecklist}
                onRemove={handleRemoveChecklist}
              />

              {activeChecklist ? (
                <ChecklistEditor
                  checklist={activeChecklist}
                  checklistIdx={activeChecklistIdx}
                  onSaveField={handleSaveChecklistField}
                  onAddItem={handleAddItem}
                  onRemoveItem={handleRemoveItem}
                  onEditItem={handleEditItem}
                  onReorderItems={handleReorderItems}
                />
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: "13px", padding: "16px 0" }}>Thêm bộ quy tắc để bắt đầu cấu hình.</div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
