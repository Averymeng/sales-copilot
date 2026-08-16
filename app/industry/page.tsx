import { getIndustryBenchmark, getEvents } from "@/lib/db";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

export default async function IndustryPage() {
  const [bench, events] = await Promise.all([getIndustryBenchmark(), getEvents()]);
  const total = bench.reduce((s, b) => s + num(b.consumption), 0) || 1;

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>行业大盘 · 动态</h1>
        <span className="badge">竞品行业监测 Agent</span>
      </div>

      <div className="card">
        <div className="card-head"><h3>各赛道昨日大盘消耗</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>单位：万元</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {bench.map((b, i) => {
            const pct = (num(b.consumption) / total) * 100;
            const wow = num(b.wow);
            return (
              <div key={i}>
                <div className="barrow">
                  <span className="lbl">{String(b.track)}</span>
                  <span className="val">{(num(b.consumption) / 10000).toFixed(0)}万</span>
                  <span className="lbl">成本</span>
                  <span className="val">{String(b.lead_cost)}</span>
                  <span className={wow >= 0 ? "tag ok" : "tag danger"} style={{ fontSize: 11 }}>
                    环比 {wow >= 0 ? "+" : ""}{(wow * 100).toFixed(1)}%
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>热度 {"🔥".repeat(num(b.heat))}</span>
                </div>
                <div className="bar">
                  <span style={{ width: `${pct}%`, background: i % 2 ? "#6366f1" : "#f97316" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><h3>关键事件 / 节点</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>共 {events.length} 条</span></div>
        {events.length === 0 ? (
          <div className="empty">暂无事件</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10, fontSize: 13.5, lineHeight: 1.6 }}>
            {events
              .slice()
              .sort((a, b) => String(b.date).localeCompare(String(a.date)))
              .map((e, i) => (
                <li key={i}>
                  <b style={{ color: "var(--ink)" }}>{String(e.date)}</b> ｜ {String(e.type)}：{String(e.title)}
                  <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 2 }}>
                    {String(e.related_account)} · {String(e.note)}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><h3>行业动态洞察</h3></div>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6 }}>
          <li>教育行业 Q3 信息流 CPM 环比 -6%，预算可多铺 1 个在投计划</li>
          <li>竞品「职上」新上『0 元试学』落地页，留资成本下降约 18%</li>
          <li>小红书新增『本地生活教育』流量池，兴趣教育获量红利期</li>
        </ul>
      </div>
    </div>
  );
}
