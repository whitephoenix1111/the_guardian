"use client";

import { useGuardianStore } from "@/store/guardianStore";
import { validateGate1 } from "@/lib/validation";

export default function Gate1Narrative() {
  const { planData, setPlanData, advance } = useGuardianStore();
  const { narrative } = planData;
  const charCount = narrative.trim().length;
  const isValid = validateGate1(narrative);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 1 — BỐI CẢNH THỊ TRƯỜNG
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Câu chuyện là gì?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "8px" }}>
          Mô tả bối cảnh vĩ mô, các mức giá quan trọng, và lý do setup này xuất hiện lúc này. Tối thiểu 100 ký tự.
        </p>
      </div>

      <div style={{ position: "relative" }}>
        <textarea
          value={narrative}
          onChange={(e) => setPlanData({ narrative: e.target.value })}
          placeholder="VD: DXY yếu sau CPI thấp hơn kỳ vọng. EUR/USD bật lên từ hỗ trợ H4 quan trọng tại 1.0820. Tâm lý thị trường chuyển sang dovish qua đêm. Tìm kiếm cơ hội tiếp diễn xu hướng..."
          rows={8}
          style={{
            width: "100%",
            background: "var(--bg)",
            border: `1px solid ${isValid ? "var(--lime-dim)" : "var(--border)"}`,
            borderRadius: "6px",
            color: "var(--text)",
            fontSize: "15px",
            padding: "16px",
            resize: "vertical",
            outline: "none",
            lineHeight: "1.6",
            fontFamily: "inherit",
            transition: "border-color 0.2s",
          }}
        />
        <div style={{
          position: "absolute", bottom: "10px", right: "12px", fontSize: "11px",
          color: isValid ? "var(--lime)" : charCount > 80 ? "var(--warning)" : "var(--text-muted)",
        }}>
          {charCount}/100
        </div>
      </div>

      {!isValid && charCount > 0 && (
        <div style={{ color: "var(--warning)", fontSize: "12px" }}>
          ⚠ Cần thêm {100 - charCount} ký tự nữa
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={advance}
          disabled={!isValid}
          style={{
            background: isValid ? "var(--lime)" : "var(--border)",
            color: isValid ? "#000" : "var(--text-muted)",
            border: "none", borderRadius: "4px",
            padding: "10px 28px", fontSize: "12px",
            fontWeight: "700", letterSpacing: "0.1em",
            cursor: isValid ? "pointer" : "not-allowed",
            transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          TIẾP THEO →
        </button>
      </div>
    </div>
  );
}
