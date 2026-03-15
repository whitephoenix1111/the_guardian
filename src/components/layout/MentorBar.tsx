"use client";

import { useGuardianStore } from "@/store/guardianStore";

const QUOTES = [
  "Mục tiêu là giao dịch tốt, không phải giao dịch nhiều.",
  "Đừng chỉ nhìn biểu đồ — hãy đọc thị trường.",
  "Quản lý rủi ro không phải tuỳ chọn. Đó là công việc.",
  "Nếu không giải thích được lệnh trong một câu, đừng vào.",
  "Amateur kết thúc khi bạn ngừng average down.",
];

const MENTOR_MESSAGES: Record<number, string> = {
  1: "Thị trường đang thực sự nói gì lúc này?",
  2: "Mỗi ô phải được tích. Không có ngoại lệ.",
  3: "Mày đang đánh bạc hay đang giao dịch?",
  4: "Hãy nói cho tao biết tại sao lệnh này sẽ thua.",
  5: "Thực thi với sự tự tin — hoặc không thực thi gì cả.",
};

export default function MentorBar() {
  const { currentGate } = useGuardianStore();
  const quote = QUOTES[(currentGate - 1) % QUOTES.length];
  const message = MENTOR_MESSAGES[currentGate];

  return (
    <footer
      style={{
        borderTop: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "12px 24px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div style={{
        width: "36px", height: "36px", borderRadius: "50%",
        background: "var(--lime-dim)", border: "2px solid var(--lime)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", flexShrink: 0, fontWeight: "700",
      }}>
        BD
      </div>

      <div style={{ flex: 1 }}>
        <span style={{ color: "var(--lime)", fontSize: "12px" }}>Brent: </span>
        <span style={{ color: "var(--text)", fontSize: "12px" }}>&quot;{message}&quot;</span>
      </div>

      <div style={{
        fontSize: "11px", color: "var(--text-muted)",
        fontStyle: "italic", textAlign: "right", maxWidth: "320px",
      }}>
        &quot;{quote}&quot;
      </div>
    </footer>
  );
}
