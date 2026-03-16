"use client";

import { useState } from "react";
import { Checklist } from "./setup.types";
import { SectionLabel } from "./setup.ui";

interface Props {
  checklists: Checklist[];
  activeIdx: number;
  onSelect: (idx: number) => void;
  onAdd: (name: string) => void;
  onRemove: (idx: number) => void;
}

export default function ChecklistTabs({ checklists, activeIdx, onSelect, onAdd, onRemove }: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName("");
    setShowAdd(false);
  };

  return (
    <div style={{ marginBottom: "28px" }}>
      <SectionLabel>BỘ QUY TẮC (CHECKLISTS)</SectionLabel>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {checklists.map((cl, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div key={cl.id} style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={() => onSelect(idx)}
                style={{
                  padding: "7px 14px", borderRadius: "4px 0 0 4px",
                  background: isActive ? "var(--lime)" : "var(--surface)",
                  borderTop: `1px solid ${isActive ? "var(--lime)" : "var(--border)"}`,
                  borderBottom: `1px solid ${isActive ? "var(--lime)" : "var(--border)"}`,
                  borderLeft: `1px solid ${isActive ? "var(--lime)" : "var(--border)"}`,
                  borderRight: "none",
                  color: isActive ? "#000" : "var(--text-muted)",
                  fontSize: "12px", fontWeight: isActive ? "700" : "400",
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
              >
                {cl.name || "(chưa đặt tên)"}
                <span style={{ marginLeft: "6px", opacity: 0.7, fontSize: "10px" }}>
                  {cl.items.length}r · ${cl.maxUsd}
                </span>
              </button>
              <button
                onClick={() => onRemove(idx)}
                style={{
                  padding: "7px 8px", borderRadius: "0 4px 4px 0",
                  background: isActive ? "rgba(239,68,68,0.15)" : "var(--surface)",
                  border: `1px solid ${isActive ? "var(--lime)" : "var(--border)"}`,
                  color: "var(--text-muted)", fontSize: "13px", lineHeight: 1,
                  cursor: "pointer", fontFamily: "inherit", transition: "color 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
              >×</button>
            </div>
          );
        })}

        {showAdd ? (
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <input
              autoFocus type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setShowAdd(false); }}
              placeholder="VD: Trade tin"
              style={{
                background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px",
                padding: "6px 10px", color: "var(--text)", fontSize: "12px",
                outline: "none", fontFamily: "inherit", width: "140px",
              }}
            />
            <button onClick={handleAdd} style={{ background: "var(--lime)", color: "#000", border: "none", borderRadius: "4px", padding: "6px 12px", fontSize: "11px", fontWeight: "700", cursor: "pointer", fontFamily: "inherit" }}>ADD</button>
            <button onClick={() => { setShowAdd(false); setNewName(""); }} style={{ background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: "4px", padding: "6px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => setShowAdd(true)}
            style={{ padding: "7px 14px", borderRadius: "4px", background: "transparent", border: "1px dashed var(--border)", color: "var(--text-muted)", fontSize: "12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--lime-dim)"; e.currentTarget.style.color = "var(--lime)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
          >+ Thêm bộ quy tắc</button>
        )}
      </div>
    </div>
  );
}
