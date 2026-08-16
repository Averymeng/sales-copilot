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
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <header className="topbar">
        <div><h1>精灵问答</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", padding: 0, overflow: "hidden" }}>
          <div className="ch" style={{ padding: "16px 18px" }}>
            <h3>🧚 觅客精灵 · 副驾</h3>
            <span className="badge violet">4 个 Agent 协同</span>
          </div>
          <div className="body" style={{ flex: 1 }}>
            {messages.length === 0 && (
              <div className="msg ai">
                <div className="who">觅客精灵 · 副驾</div>
                你好，承泽。随时问我——查数据、出方案、做复盘，我会自动路由到对应的 Agent。
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role === "user" ? "me" : "ai"}`}>
                {m.role === "ai" && m.agent && <div className="who">{AGENT_LABEL[m.agent] || m.agent}</div>}
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="msg ai">
                <div className="typing"><i /><i /><i /></div>
              </div>
            )}
          </div>
          <div className="chips">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="chip" onClick={() => ask(s)}>{s}</button>
            ))}
          </div>
          <div className="foot">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="问问：今天有什么紧急？帮我找新客户 / 最近行业有什么变化"
            />
            <button onClick={() => ask()} disabled={loading}>{loading ? "…" : "➤"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
