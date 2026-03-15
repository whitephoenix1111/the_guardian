"use client";

import { useGuardianStore } from "@/store/guardianStore";
import { validateGate4 } from "@/lib/validation";

export default function Gate4PreMortem() {
  const { planData, setPlanData, advance, goBack } = useGuardianStore();
  const { preMortem } = planData;
  const isValid = validateGate4(preMortem);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div>
        <h2 style={{ color: "var(--lime)", fontSize: "11px", letterSpacing: "0.15em", marginBottom: "8px" }}>
          GATE 4 — PRE-MORTEM
        </h2>
        <p style={{ color: "var(--text)", fontSize: "20px", fontWeight: "600", margin: 0 }}>
          Tại sao lệnh này sẽ thua?
        </p>
        <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "8px" }}>
          Bắt buộc phải nói rõ rủi ro. Đây là cách diệt confirmation bias trước khi nó diệt tài khoản của mày.
        </p>
      </div>

      <textarea
        value={preMortem}
        onChange={(e) => setPlanData({ preMortem: e.target.value })}
        placeholder="VD: Nếu DXY đảo chiều tăng sau dữ liệu việc làm mạnh hơn kỳ vọng, lệnh long EUR/USD sẽ bị stop ngay. Cũng cần theo dõi kháng cự tại 1.0880 — nếu giá chững lại ở đó, kế hoạch bị vô hiệu..."
        rows={7}
        style={{
          width: "100%", background: "var(--bg)",
          border: `1px solid ${isValid ? "var(--lime-dim)" : "var(--border)"}`,
          borderRadius: "6px", color: "var(--text)", fontSize: "13px",
          padding: "14px", resize: "vertical", outline: "none",
          lineHeight: "1.6", fontFamily: "inherit", transition: "border-color 0.2s",
        }}
      />

      {!isValid && (
        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          Không được bỏ trống. Bỏ qua bước này không phải lựa chọn.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <button onClick={goBack} style={backBtnStyle}>← QUAY LẠI</button>
        <button onClick={advance} disabled={!isValid} style={isValid ? nextBtnActiveStyle : nextBtnDisabledStyle}>
          TIẾP THEO →
        </button>
      </div>
    </div>
  );
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
