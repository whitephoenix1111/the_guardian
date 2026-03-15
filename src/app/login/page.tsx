"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: username.trim(), password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/plan");
    } else {
      const data = await res.json();
      setError(data.error ?? "Đăng nhập thất bại.");
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "var(--bg)",
    }}>
      <div style={{ width: "100%", maxWidth: "360px", padding: "0 24px" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            fontSize: "20px", fontWeight: "700", letterSpacing: "0.12em",
            color: "var(--lime)",
          }}>
            ◈ THE GUARDIAN
          </div>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            letterSpacing: "0.1em", marginTop: "6px",
          }}>
            TERMINAL
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "32px 28px",
          display: "flex", flexDirection: "column", gap: "16px",
        }}>
          <div style={{
            fontSize: "11px", color: "var(--text-muted)",
            letterSpacing: "0.12em", marginBottom: "4px",
          }}>
            ĐĂNG NHẬP
          </div>

          {/* Username */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              TÊN ĐĂNG NHẬP
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoFocus
              autoComplete="username"
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", letterSpacing: "0.08em" }}>
              MẬT KHẨU
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ fontSize: "12px", color: "var(--danger)" }}>
              ⚠ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleLogin}
            disabled={loading || !username.trim() || !password.trim()}
            style={{
              marginTop: "4px",
              background: (!loading && username.trim() && password.trim())
                ? "var(--lime)" : "var(--border)",
              color: (!loading && username.trim() && password.trim())
                ? "#000" : "var(--text-muted)",
              border: "none", borderRadius: "4px",
              padding: "11px", fontSize: "12px",
              fontWeight: "700", letterSpacing: "0.1em",
              cursor: (!loading && username.trim() && password.trim())
                ? "pointer" : "not-allowed",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
          >
            {loading ? "ĐANG KIỂM TRA..." : "VÀO TERMINAL →"}
          </button>
        </div>

        <div style={{
          textAlign: "center", marginTop: "20px",
          fontSize: "11px", color: "var(--text-muted)",
          letterSpacing: "0.06em",
        }}>
          Trade with discipline. No exceptions.
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "10px 14px",
  color: "var(--text)",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
