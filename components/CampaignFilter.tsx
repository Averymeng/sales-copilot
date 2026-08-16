"use client";
import { useEffect, useRef, useState } from "react";

export default function CampaignFilter({ clients, stages }: { clients: string[]; stages: string[] }) {
  const [client, setClient] = useState("");
  const [stage, setStage] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.querySelectorAll<HTMLElement>(".cf-detail").forEach((el) => {
      const c = el.getAttribute("data-client") || "";
      const s = el.getAttribute("data-stage") || "";
      const okC = !client || c === client;
      const okS = !stage || s === stage;
      el.style.display = okC && okS ? "" : "none";
    });
  }, [client, stage]);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, marginBottom: 22, flexWrap: "wrap" }}>
      <div className="fb-field">
        <label>客户</label>
        <select className="fb-select" value={client} onChange={(e) => setClient(e.target.value)}>
          <option value="">全部客户</option>
          {clients.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="fb-field">
        <label>阶段</label>
        <select className="fb-select" value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">全部阶段</option>
          {stages.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="act-bar">
        <span className="badge blue">按客户 / 阶段筛选投放表现</span>
      </div>
    </div>
  );
}
