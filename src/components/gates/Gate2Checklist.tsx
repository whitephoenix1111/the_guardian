"use client";

import { useEffect, useState } from "react";
import { useGuardianStore } from "@/store/guardianStore";
import { validateGate2, ChecklistItem, ChecklistValue } from "@/lib/validation";

export default function Gate2Checklist() {
  const { planData, setPlanData, advance, goBack } = useGuardianStore();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        const checklist: ChecklistItem[] = data.checklist || [];
        setItems(checklist);
        if (planData.checklist.length !== checklist.length) {
          setPlanData({
            checklistItems: checklist,
            checklist: checklist.map((item) => {
              if (item.type === "checkbox") return false;
              return "";
            }),
          });
        } else {
          setPlanData({ checklistItems: checklist });
        }
        setLoading(false);
      });
  }, []);

  const setValue = (index: number, val: ChecklistValue) => {
    const updated = [...planData.checklist];
    updated[index] = val;
    setPlanData({ checklist: updated });
  };

  const isValid = validateGate2(planData.checklist, items);
  const passCount = items.filter((item, i) => itemPasses(item, planData.checklist[i])).length;

  if (loading) return <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Đang tải checklist...</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 2 — CHECKLIST KỸ THUẬT
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Setup có đủ điều kiện không?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
          Tất cả điều kiện phải đạt. Không có ngoại lệ.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, index) => (
          <RuleRow
            key={item.id}
            item={item}
            value={planData.checklist[index]}
            onChange={(v) => setValue(index, v)}
          />
        ))}
      </div>

      <div style={{ fontSize: "12px", color: isValid ? "var(--lime)" : "var(--text-muted)" }}>
        {passCount}/{items.length} điều kiện đạt
        {!isValid && passCount > 0 && " — Cần tất cả đều pass"}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={goBack} style={backBtnStyle}>← QUAY LẠI</button>
        <button onClick={advance} disabled={!isValid} style={isValid ? nextBtnActiveStyle : nextBtnDisabledStyle}>
          TIẾP THEO →
        </button>
      </div>
    </div>
  );
}

function RuleRow({ item, value, onChange }: {
  item: ChecklistItem;
  value: ChecklistValue;
  onChange: (v: ChecklistValue) => void;
}) {
  const passing = itemPasses(item, value);

  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: "14px",
    padding: "14px 16px",
    background: passing ? "rgba(163,230,53,0.06)" : "var(--bg)",
    border: `1px solid ${passing ? "var(--lime-dim)" : "var(--border)"}`,
    borderRadius: "6px", transition: "all 0.15s",
  };

  const dot = (
    <div style={{
      width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
      background: passing ? "var(--lime)" : "var(--border)", transition: "background 0.15s",
    }} />
  );

  if (item.type === "checkbox") {
    return (
      <div style={{ ...rowStyle, cursor: "pointer" }} onClick={() => onChange(!value)}>
        <div style={{
          width: "20px", height: "20px", borderRadius: "3px", flexShrink: 0,
          border: `2px solid ${passing ? "var(--lime)" : "var(--text-muted)"}`,
          background: passing ? "var(--lime)" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "12px", color: "#000", transition: "all 0.15s",
        }}>
          {passing && "✓"}
        </div>
        <span style={{ fontSize: "13px", color: passing ? "var(--text)" : "var(--text-muted)", flex: 1 }}>
          {item.label}
        </span>
      </div>
    );
  }

  if (item.type === "number") {
    const hint = item.threshold !== undefined ? `${item.operator ?? ">="} ${item.threshold}` : "bất kỳ số";
    return (
      <div style={rowStyle}>
        {dot}
        <span style={{ fontSize: "13px", color: "var(--text)", flex: 1 }}>{item.label}</span>
        <span style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.06em" }}>{hint}</span>
        <input
          type="number" value={value as string} onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          style={{
            width: "90px", background: "var(--surface)",
            border: `1px solid ${passing ? "var(--lime-dim)" : "var(--border)"}`,
            borderRadius: "4px", padding: "6px 10px",
            color: "var(--text)", fontSize: "13px", outline: "none",
            fontFamily: "inherit", textAlign: "right",
          }}
        />
      </div>
    );
  }

  if (item.type === "select") {
    return (
      <div style={rowStyle}>
        {dot}
        <span style={{ fontSize: "13px", color: "var(--text)", flex: 1 }}>{item.label}</span>
        <select value={value as string} onChange={(e) => onChange(e.target.value)}
          style={{
            background: "var(--surface)",
            border: `1px solid ${passing ? "var(--lime-dim)" : "var(--border)"}`,
            borderRadius: "4px", padding: "6px 10px",
            color: value ? "var(--text)" : "var(--text-muted)",
            fontSize: "13px", outline: "none", fontFamily: "inherit", cursor: "pointer",
          }}>
          <option value="">— chọn —</option>
          {(item.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    );
  }

  return null;
}

function itemPasses(item: ChecklistItem, val: ChecklistValue): boolean {
  if (item.type === "checkbox") return val === true;
  if (item.type === "number") {
    const num = parseFloat(val as string);
    if (isNaN(num)) return false;
    if (item.threshold === undefined) return true;
    return item.operator === ">=" ? num >= item.threshold : num <= item.threshold;
  }
  if (item.type === "select") return typeof val === "string" && val.trim().length > 0;
  return false;
}

const backBtnStyle: React.CSSProperties = {
  background: "transparent", color: "var(--text-muted)",
  border: "1px solid var(--border)", borderRadius: "4px",
  padding: "10px 20px", fontSize: "12px", cursor: "pointer", fontFamily: "inherit",
};
const nextBtnActiveStyle: React.CSSProperties = {
  background: "var(--lime)", color: "#000", border: "none",
  borderRadius: "4px", padding: "10px 28px", fontSize: "12px",
  fontWeight: "700", letterSpacing: "0.1em", cursor: "pointer", fontFamily: "inherit",
};
const nextBtnDisabledStyle: React.CSSProperties = {
  ...nextBtnActiveStyle, background: "var(--border)", color: "var(--text-muted)", cursor: "not-allowed",
};
