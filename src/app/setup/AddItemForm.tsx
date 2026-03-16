"use client";

import { useState } from "react";
import { ChecklistItem, ChecklistItemType, TYPE_LABELS, BLANK_ITEM, inputStyle, addOptBtnStyle } from "./setup.types";
import { FieldLabel } from "./setup.ui";

interface Props {
  onAdd: (item: ChecklistItem) => void;
}

export default function AddItemForm({ onAdd }: Props) {
  const [draft, setDraft] = useState(BLANK_ITEM());
  const [newOption, setNewOption] = useState("");

  const handleAdd = () => {
    if (!draft.label.trim()) return;
    const item: ChecklistItem = {
      ...draft,
      id: String(Date.now()),
      label: draft.label.trim(),
      threshold: draft.type === "number" ? draft.threshold : undefined,
      operator:  draft.type === "number" ? draft.operator  : undefined,
      options:   draft.type === "select" ? draft.options   : undefined,
    };
    onAdd(item);
    setDraft(BLANK_ITEM());
    setNewOption("");
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    setDraft(d => ({ ...d, options: [...(d.options ?? []), newOption.trim()] }));
    setNewOption("");
  };

  const removeOption = (opt: string) =>
    setDraft(d => ({ ...d, options: (d.options ?? []).filter(o => o !== opt) }));

  return (
    <div style={{ background: "var(--bg)", border: "1px dashed var(--border)", borderRadius: "6px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.1em" }}>QUY TẮC MỚI</div>

      <div>
        <FieldLabel>Mô tả quy tắc</FieldLabel>
        <input
          type="text" value={draft.label}
          onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
          onKeyDown={e => e.key === "Enter" && handleAdd()}
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
              background: draft.type === t ? "var(--lime)" : "var(--surface)",
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
              <span key={opt} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 10px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "3px", fontSize: "12px", color: "var(--text)" }}>
                {opt}
                <button onClick={() => removeOption(opt)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, fontSize: "13px", lineHeight: 1 }}>×</button>
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

      <button onClick={handleAdd} disabled={!draft.label.trim()} style={{
        alignSelf: "flex-start",
        background: draft.label.trim() ? "var(--lime)" : "var(--border)",
        color: draft.label.trim() ? "#000" : "var(--text-muted)",
        border: "none", borderRadius: "4px", padding: "9px 22px",
        fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em",
        cursor: draft.label.trim() ? "pointer" : "default",
        fontFamily: "inherit", transition: "all 0.15s",
      }}>
        + THÊM QUY TẮC
      </button>
    </div>
  );
}
