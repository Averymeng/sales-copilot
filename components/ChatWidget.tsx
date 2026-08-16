"use client";

import { useState } from "react";

type Msg = { role: "user" | "ai"; text: string; agent?: string };

const SUGGESTIONS = ["今天有什么紧急", "帮我找新客户", "最近行业有什么变化"];

const AGENT_LABEL: Record<string, string> = {
  "盯盘/值守": "🛡 盯盘/值守",
  "商机发现": "🔍 商机发现",
  "竞品/行业监测": "📡 行业监测",
  "总控编排": "🧠 总控编排",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  async function ask(q?: string) {
    const text = (q ?? input).trim();
    if (!text || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "ai", text: data.summary || "", agent: data.agent }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "ai", text: "请求失败：" + (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open ? (
        <div
          style={{
            position: "fixed", right: 20, bottom: 20, width: 360, height: 520,
            background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,.18)",
            display: "flex", flexDirection: "column", overflow: "hidden", zIndex: 50,
          }}
        >
          <div style={{ padding: "12px 16px", background: "var(--primary)", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>🧚 精灵问答</span>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ color: "var(--muted)", fontSize: 13, margin: "auto", textAlign: "center" }}>
                随时问我（自动路由到对应 Agent）
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 3 }}>
                {m.role === "ai" && m.agent && <span style={{ fontSize: 11, color: "var(--primary)" }}>{AGENT_LABEL[m.agent] || m.agent}</span>}
                <div style={{ maxWidth: "85%", padding: "8px 12px", borderRadius: 12, fontSize: 13, lineHeight: 1.55, whiteSpace: "pre-wrap", background: m.role === "user" ? "var(--primary)" : "var(--bg)", color: m.role === "user" ? "#fff" : "var(--ink)" }}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && <div style={{ color: "var(--muted)", fontSize: 12 }}>思考中…</div>}
          </div>
          <div style={{ padding: 10, borderTop: "1px solid var(--line)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)} style={{ border: "1px solid var(--line)", background: "#fff", borderRadius: 999, padding: "4px 10px", fontSize: 11.5, color: "var(--ink)", cursor: "pointer" }}>{s}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, padding: "0 10px 10px" }}>
            <input
              value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="问点什么…"
              style={{ flex: 1, height: 38, border: "1px solid var(--line)", borderRadius: 999, padding: "0 14px", fontSize: 13, outline: "none" }}
            />
            <button onClick={() => ask()} disabled={loading} style={{ height: 38, padding: "0 16px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontSize: 13, cursor: "pointer" }}>{loading ? "…" : "发"}</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          style={{ position: "fixed", right: 20, bottom: 20, width: 56, height: 56, borderRadius: "50%", background: "var(--primary)", color: "#fff", border: "none", fontSize: 24, cursor: "pointer", boxShadow: "0 8px 24px rgba(99,102,241,.4)", zIndex: 50 }}
          title="精灵问答"
        >
          🧚
        </button>
      )}
    </>
  );
}
