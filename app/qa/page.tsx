"use client";

import { useState } from "react";

export default function QAPage() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!input.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      setAnswer(data.summary || JSON.stringify(data));
    } catch (e) {
      setAnswer("请求失败：" + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>精灵问答</h1>
      </div>
      <div className="card">
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder="问问：今天有什么紧急？帮我找新客户 / 最近行业有什么变化"
            style={{
              flex: 1, height: 40, border: "1px solid var(--line)", borderRadius: 999,
              padding: "0 16px", fontSize: 14, outline: "none",
            }}
          />
          <button
            onClick={ask}
            disabled={loading}
            style={{
              height: 40, padding: "0 20px", borderRadius: 999, border: "none",
              background: "var(--primary)", color: "#fff", fontSize: 14, cursor: "pointer",
            }}
          >
            {loading ? "思考中…" : "发送"}
          </button>
        </div>
        {answer && (
          <div style={{ background: "var(--bg)", borderRadius: 12, padding: 16, whiteSpace: "pre-wrap" }}>
            {answer}
          </div>
        )}
        <div style={{ marginTop: 14, color: "var(--muted)", fontSize: 12 }}>
          试：『今天有什么紧急』『帮我找新客户』『最近行业有什么变化』
        </div>
      </div>
    </div>
  );
}
