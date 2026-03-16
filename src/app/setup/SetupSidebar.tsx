"use client";

import { Setup, BLANK_CHECKLIST, inputStyle } from "./setup.types";

interface Props {
  setup: Setup;
  activeInstrument: string | null;
  onSelectInstrument: (name: string) => void;
  onAddInstrument: (name: string) => void;
  onRemoveInstrument: (name: string) => void;
  onSaveEquity: (val: number) => void;
}

export default function SetupSidebar({
  setup, activeInstrument,
  onSelectInstrument, onAddInstrument, onRemoveInstrument, onSaveEquity,
}: Props) {
  const [newName, setNewName] = (require("react") as typeof import("react")).useState("");
  const [showAdd, setShowAdd] = (require("react") as typeof import("react")).useState(false);

  const handleAdd = () => {
    const name = newName.trim().toUpperCase();
    if (!name || setup.instruments[name]) return;
    onAddInstrument(name);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <aside style={{
      background: "var(--surface)", borderRight: "1px solid var(--border)",
      width: "200px", flexShrink: 0, display: "flex", flexDirection: "column",
      padding: "20px 12px", gap: "6px", overflowY: "auto",
    }}>
      {/* Equity */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "6px" }}>
          VỐN TÀI KHOẢN
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>$</span>
          <input
            type="number"
            defaultValue={setup.equity}
            onBlur={e => onSaveEquity(parseFloat(e.target.value) || 0)}
            onKeyDown={e => e.key === "Enter" && onSaveEquity(parseFloat((e.target as HTMLInputElement).value) || 0)}
            style={{ ...inputStyle, width: "100%", fontSize: "12px", padding: "6px 8px" }}
          />
        </div>
      </div>

      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: "4px" }}>
        INSTRUMENTS
      </div>

      {Object.keys(setup.instruments).map((name) => {
        const isActive = name === activeInstrument;
        return (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button
              onClick={() => onSelectInstrument(name)}
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
              onClick={() => onRemoveInstrument(name)}
              style={{ background: "none", border: "none", color: "var(--border)", cursor: "pointer", fontSize: "15px", padding: "0 4px", lineHeight: 1, transition: "color 0.15s", flexShrink: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--border)")}
            >×</button>
          </div>
        );
      })}

      {showAdd ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "6px" }}>
          <input
            autoFocus type="text"
            value={newName}
            onChange={e => setNewName(e.target.value.toUpperCase())}
            onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
            placeholder="VD: GBP/JPY"
            style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px", width: "100%" }}
          />
          <div style={{ display: "flex", gap: "6px" }}>
            <button onClick={handleAdd} style={{ flex: 1, background: "var(--lime)", color: "#000", border: "none", borderRadius: "3px", padding: "6px 0", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>ADD</button>
            <button onClick={() => { setShowAdd(false); setNewName(""); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "3px", padding: "6px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          style={{ marginTop: "6px", padding: "7px 10px", borderRadius: "4px", background: "transparent", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "border-color 0.15s, color 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime-dim)"; e.currentTarget.style.color = "var(--lime)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
        >+ Thêm instrument</button>
      )}
    </aside>
  );
}
