"use client";
import { useState } from "react";

export default function Generator({
  type,
  context,
  accountId,
  label = "✨ 一键生成",
}: {
  type: "copy" | "research" | "proposal" | "report";
  context: string;
  accountId?: string | number;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true);
    setErr("");
    setText("");
    try {
      const r = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, context, accountId }),
      });
      const data = await r.json();
      if (data.error) {
        setErr(data.error);
      } else {
        let out = data.text || "";
        if (data.id) out += `\n\n（已写入报告库 #${data.id}，刷新页面可在「报告」查看）`;
        setText(out);
      }
    } catch {
      setErr("生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn" onClick={run} disabled={loading}>
        {loading ? "AI 生成中…" : label}
      </button>
      {err && <div className="empty" style={{ padding: "12px 0" }}>{err}</div>}
      {text && <div className="gen-out">{text}</div>}
    </div>
  );
}
