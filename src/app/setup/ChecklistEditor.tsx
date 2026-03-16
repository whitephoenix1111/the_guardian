"use client";

import { useState, useRef } from "react";
import { Checklist, ChecklistItem, ChecklistItemType, TYPE_LABELS, inputStyle, removeBtnStyle, addOptBtnStyle } from "./setup.types";
import { FieldLabel } from "./setup.ui";
import AddItemForm from "./AddItemForm";

interface Props {
  checklist: Checklist;
  checklistIdx: number;
  onSaveField: (idx: number, field: keyof Checklist, val: unknown) => void;
  onAddItem: (item: ChecklistItem) => void;
  onRemoveItem: (itemId: string) => void;
  onEditItem: (itemId: string, updated: ChecklistItem) => void;
  onReorderItems: (newItems: ChecklistItem[]) => void;
}

function EditItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: ChecklistItem;
  onSave: (updated: ChecklistItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ChecklistItem>({ ...item });
  const [newOption, setNewOption] = useState("");

  const addOption = () => {
    if (!newOption.trim()) return;
    setDraft(d => ({ ...d, options: [...(d.options ?? []), newOption.trim()] }));
    setNewOption("");
  };
  const removeOption = (opt: string) =>
    setDraft(d => ({ ...d, options: (d.options ?? []).filter(o => o !== opt) }));

  const handleSave = () => {
    if (!draft.label.trim()) return;
    onSave({
      ...draft,
      label: draft.label.trim(),
      threshold: draft.type === "number" ? draft.threshold : undefined,
      operator:  draft.type === "number" ? draft.operator  : undefined,
      options:   draft.type === "select" ? draft.options   : undefined,
    });
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--lime-dim)",
      borderRadius: "6px", padding: "16px",
      display: "flex", flexDirection: "column", gap: "12px",
    }}>
      <div style={{ fontSize: "10px", color: "var(--lime)", letterSpacing: "0.1em" }}>CHỈNH SỬA QUY TẮC</div>

      <div>
        <FieldLabel>Mô tả quy tắc</FieldLabel>
        <input
          autoFocus
          type="text"
          value={draft.label}
          onChange={e => setDraft(d => ({ ...d, label: e.target.value }))}
          onKeyDown={e => e.key === "Enter" && handleSave()}
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
            <select
              value={draft.operator ?? ">="}
              onChange={e => setDraft(d => ({ ...d, operator: e.target.value as ">=" | "<=" }))}
              style={{ ...inputStyle, width: "130px" }}
            >
              <option value=">=">≥ (tối thiểu)</option>
              <option value="<=">≤ (tối đa)</option>
            </select>
          </div>
          <div>
            <FieldLabel>Ngưỡng</FieldLabel>
            <input
              type="number" step="any"
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
                <button onClick={() => removeOption(opt)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 0, fontSize: "13px", lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text" value={newOption}
              onChange={e => setNewOption(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addOption()}
              placeholder="Thêm lựa chọn..."
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={addOption} style={addOptBtnStyle}>ADD</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button onClick={handleSave} disabled={!draft.label.trim()} style={{
          background: draft.label.trim() ? "var(--lime)" : "var(--border)",
          color: draft.label.trim() ? "#000" : "var(--text-muted)",
          border: "none", borderRadius: "4px", padding: "8px 20px",
          fontSize: "12px", fontWeight: "700", letterSpacing: "0.08em",
          cursor: draft.label.trim() ? "pointer" : "default",
          fontFamily: "inherit", transition: "all 0.15s",
        }}>
          LƯU
        </button>
        <button onClick={onCancel} style={{
          background: "none", border: "1px solid var(--border)", borderRadius: "4px",
          color: "var(--text-muted)", padding: "8px 16px",
          fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
        }}>
          HỦY
        </button>
      </div>
    </div>
  );
}

export default function ChecklistEditor({
  checklist, checklistIdx, onSaveField, onAddItem, onRemoveItem, onEditItem, onReorderItems,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  // ── drag state ──────────────────────────────────────────────
  const dragId = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    dragId.current = id;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== dragId.current) setDragOverId(id);
  };

  const handleDrop = (targetId: string) => {
    const srcId = dragId.current;
    if (!srcId || srcId === targetId) { resetDrag(); return; }

    const items = [...checklist.items];
    const srcIdx = items.findIndex(i => i.id === srcId);
    const tgtIdx = items.findIndex(i => i.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) { resetDrag(); return; }

    const [moved] = items.splice(srcIdx, 1);
    items.splice(tgtIdx, 0, moved);
    onReorderItems(items);
    resetDrag();
  };

  const resetDrag = () => {
    dragId.current = null;
    setDragOverId(null);
  };

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "6px", padding: "24px",
      display: "flex", flexDirection: "column", gap: "20px",
    }}>
      {/* Tên + max risk */}
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <FieldLabel>TÊN BỘ QUY TẮC</FieldLabel>
          <input
            type="text"
            defaultValue={checklist.name}
            key={checklist.id + "-name"}
            onBlur={e => onSaveField(checklistIdx, "name", e.target.value.trim())}
            onKeyDown={e => e.key === "Enter" && onSaveField(checklistIdx, "name", (e.target as HTMLInputElement).value.trim())}
            style={{ ...inputStyle, width: "100%" }}
          />
        </div>
        <div>
          <FieldLabel>VỐN TỐI ĐA / LỆNH ($)</FieldLabel>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>$</span>
            <input
              type="number" min="1" step="1"
              defaultValue={checklist.maxUsd}
              key={checklist.id + "-maxusd"}
              onBlur={e => onSaveField(checklistIdx, "maxUsd", parseFloat(e.target.value) || 100)}
              onKeyDown={e => e.key === "Enter" && onSaveField(checklistIdx, "maxUsd", parseFloat((e.target as HTMLInputElement).value) || 100)}
              style={{ ...inputStyle, width: "90px" }}
            />
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>USD</span>
          </div>
        </div>
      </div>

      {/* Danh sách rules */}
      <div>
        <FieldLabel>QUY TẮC ({checklist.items.length})</FieldLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "16px" }}>
          {checklist.items.length === 0 && (
            <div style={{ color: "var(--text-muted)", fontSize: "12px", padding: "4px 0" }}>Chưa có quy tắc nào.</div>
          )}
          {checklist.items.map((item, idx) =>
            editingId === item.id ? (
              <EditItemForm
                key={item.id}
                item={item}
                onSave={updated => { onEditItem(item.id, updated); setEditingId(null); }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                key={item.id}
                draggable
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={e => handleDragOver(e, item.id)}
                onDrop={() => handleDrop(item.id)}
                onDragEnd={resetDrag}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 14px", borderRadius: "4px",
                  background: dragOverId === item.id ? "rgba(163,230,53,0.06)" : "var(--bg)",
                  border: `1px solid ${dragOverId === item.id ? "var(--lime-dim)" : "var(--border)"}`,
                  opacity: dragId.current === item.id ? 0.4 : 1,
                  cursor: "grab",
                  transition: "background 0.1s, border-color 0.1s, opacity 0.1s",
                }}
              >
                {/* Drag handle */}
                <span style={{
                  color: "var(--border)", fontSize: "14px", lineHeight: 1,
                  cursor: "grab", flexShrink: 0, userSelect: "none",
                  letterSpacing: "-2px",
                }} title="Kéo để sắp xếp">⠿</span>

                <span style={{ color: "var(--text-muted)", fontSize: "11px", width: "18px", flexShrink: 0 }}>
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <span style={{
                  fontSize: "10px", letterSpacing: "0.08em", padding: "2px 7px",
                  borderRadius: "3px", background: "var(--surface)",
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
                {/* Edit btn */}
                <button
                  onClick={() => setEditingId(item.id)}
                  style={{ ...removeBtnStyle, fontSize: "13px" }}
                  title="Chỉnh sửa"
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--lime)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >✎</button>
                {/* Remove btn */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={removeBtnStyle}
                  title="Xóa"
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >×</button>
              </div>
            )
          )}
        </div>

        <AddItemForm onAdd={item => { onAddItem(item); }} />
      </div>
    </div>
  );
}
