"use client";

import { useState } from "react";

type Msg = { role: "user" | "ai"; text: string; agent?: string };

const SUGGESTIONS = ["今天有什么紧急", "帮我找新客户", "最近行业有什么变化", "给华图写个 Q4 方案"];

const AGENT_LABEL: Record<string, string> = {
  "盯盘/值守": "🛡 盯盘/值守 Agent",
  "商机发现": "🔍 商机发现 Agent",
  "竞品/行业监测": "📡 行业监测 Agent",
  "总控编排": "🧠 总控编排",
};

export default function QAPage() {
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
      setMessages((m) => [
        ...m,
        { role: "ai", text: data.summary || JSON.stringify(data), agent: data.agent },
      ]);
    } catch (e) {
      setMessages((m) => [...m, { role: "ai", text: "请求失败：" + (e as Error).message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 140px)" }}>
      <div className="card-head" style={{ marginBottom: 14 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>精灵问答</h1>
        <span style={{ color: "var(--muted)", fontSize: 12 }}>4 个 Agent 协同 · 自然语言驱动</span>
      </div>

      <div className="card" style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.length === 0 && (
          <div style={{ color: "var(--muted)", fontSize: 14, textAlign: "center", margin: "auto" }}>
            试试问我 👇（问题会自动路由到对应 Agent）
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: m.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
            {m.role === "ai" && m.agent && (
              <span style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600 }}>{AGENT_LABEL[m.agent] || m.agent}</span>
            )}
            <div
              style={{
                maxWidth: "82%",
                padding: "10px 14px",
                borderRadius: 14,
                fontSize: 14,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                background: m.role === "user" ? "var(--primary)" : "var(--bg)",
                color: m.role === "user" ? "#fff" : "var(--ink)",
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: "var(--muted)", fontSize: 13 }}>思考中…</div>}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "12px 0" }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            style={{ border: "1px solid var(--line)", background: "#fff", borderRadius: 999, padding: "6px 12px", fontSize: 12.5, color: "var(--ink)", cursor: "pointer" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="问问：今天有什么紧急？帮我找新客户 / 最近行业有什么变化"
          style={{ flex: 1, height: 44, border: "1px solid var(--line)", borderRadius: 999, padding: "0 16px", fontSize: 14, outline: "none" }}
        />
        <button
          onClick={() => ask()}
          disabled={loading}
          style={{ height: 44, padding: "0 22px", borderRadius: 999, border: "none", background: "var(--primary)", color: "#fff", fontSize: 14, cursor: "pointer" }}
        >
          {loading ? "…" : "发送"}
        </button>
      </div>
    </div>
  );
}
