import React from "react";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.12em", marginBottom: "12px" }}>
      {children}
    </div>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "10px", color: "var(--text-muted)", letterSpacing: "0.08em", marginBottom: "6px" }}>
      {children}
    </div>
  );
}
