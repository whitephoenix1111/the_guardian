import type React from "react";
import { ChecklistItem, ChecklistItemType, Checklist } from "@/lib/validation";
import { Setup } from "@/app/api/setup/route";

export type { ChecklistItem, ChecklistItemType, Checklist, Setup };

export const TYPE_LABELS: Record<ChecklistItemType, string> = {
  checkbox: "✓ Checkbox",
  number:   "# Number",
  select:   "≡ Select",
};

export const BLANK_ITEM = (): Omit<ChecklistItem, "id"> => ({
  label: "", type: "checkbox", operator: ">=", threshold: undefined, options: [],
});

export const BLANK_CHECKLIST = (instrumentId: string): Checklist => ({
  id: `${instrumentId}-${Date.now()}`,
  name: "",
  maxUsd: 100,
  items: [],
});

export const inputStyle: React.CSSProperties = {
  background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "4px",
  padding: "8px 12px", color: "var(--text)", fontSize: "13px",
  outline: "none", fontFamily: "inherit",
};

export const removeBtnStyle: React.CSSProperties = {
  background: "none", border: "none", color: "var(--text-muted)",
  cursor: "pointer", fontSize: "16px", padding: "0 4px", lineHeight: 1,
  transition: "color 0.15s",
};

export const addOptBtnStyle: React.CSSProperties = {
  background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "4px",
  color: "var(--text-muted)", fontSize: "11px", fontWeight: "700",
  letterSpacing: "0.08em", padding: "8px 14px", cursor: "pointer", fontFamily: "inherit",
};
