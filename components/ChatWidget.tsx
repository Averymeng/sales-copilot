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
      <button className="fab" title="AI 副驾" onClick={() => setOpen(true)} style={{ display: open ? "none" : "grid" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
        </svg>
      </button>

      <div className={`chat${open ? " open" : ""}`}>
        <div className="head">
          <div className="av">觅</div>
          <div>
            <div className="t">觅客精灵 · 副驾</div>
            <div className="s">随时问我 · 查数据 / 出方案 / 做复盘</div>
          </div>
          <button className="x" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="body">
          {messages.length === 0 && (
            <div className="msg ai">
              <div className="who">觅客精灵 · 副驾</div>
              你好，承泽。今天的早报已生成，有异常需关注。需要我帮你排查或出方案吗？
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
              <div className="typing">
                <i /><i /><i />
              </div>
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
            placeholder="问点什么…"
          />
          <button onClick={() => ask()} disabled={loading}>{loading ? "…" : "➤"}</button>
        </div>
      </div>
    </>
  );
}
