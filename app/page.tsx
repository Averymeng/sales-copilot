import { getOverview, getIndustryBenchmark } from "@/lib/db";
export const dynamic = "force-dynamic";

function healthClass(v: unknown): string {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("danger")) return "h-danger";
  if (s.includes("预警") || s.includes("未")) return "h-warn";
  if (s.includes("健康") || s.includes("normal")) return "h-ok";
  return "";
}
function urgencyTag(u: unknown) {
  const s = String(u || "");
  if (s.includes("紧急")) return <span className="tag danger">紧急</span>;
  if (s.includes("高")) return <span className="tag warn">高</span>;
  return <span className="tag">{s}</span>;
}

export default async function HomePage() {
  const { kpis, accounts, activeCampaigns, todoTasks, leads, runs } = await getOverview();
  const bench = await getIndustryBenchmark();

  // 业绩饼图：在投计划按投放目标分布
  const objMap: Record<string, number> = {};
  for (const c of activeCampaigns) {
    const o = String(c.objective || "未定");
    objMap[o] = (objMap[o] || 0) + 1;
  }
  const objColors: Record<string, string> = { 进线: "#f97316", 开口: "#6366f1", 留资: "#10b981", 未定: "#cbd5e1" };
  const objEntries = Object.entries(objMap);
  const objTotal = objEntries.reduce((a, [, n]) => a + n, 0) || 1;
  let acc = 0;
  const pieStops = objEntries
    .map(([o, n]) => {
      const start = (acc / objTotal) * 360;
      acc += n;
      const end = (acc / objTotal) * 360;
      return `${objColors[o] || "#cbd5e1"} ${start}deg ${end}deg`;
    })
    .join(", ");

  // 今日3件事：优先紧急/高，取前 3
  const sorted = [...todoTasks].sort((a, b) => {
    const rank = (x: unknown) => (String(x).includes("紧急") ? 0 : String(x).includes("高") ? 1 : 2);
    return rank(a.urgency) - rank(b.urgency);
  });
  const top3 = sorted.slice(0, 3);

  // 关键变化（基于数据衍生，无需 LLM，秒级渲染）
  const warnAccounts = accounts.filter((a) => healthClass(a.health) === "h-warn" || healthClass(a.health) === "h-danger");
  const changes = [
    { k: "紧急待办", v: `${kpis.urgent} 项需今天处理`, c: kpis.urgent > 0 ? "danger" : "ok" },
    { k: "健康度预警客户", v: `${warnAccounts.length} 家投放指标下滑`, c: warnAccounts.length > 0 ? "warn" : "ok" },
    { k: "在投计划", v: `${kpis.activeCampaigns} 个运行中`, c: "ok" },
    { k: "本周 Agent 运行", v: `${kpis.runs} 次`, c: "ok" },
  ];

  // 行业动态（数据驱动：来自 industry_benchmark 赛道大盘）
  const industry =
    bench.length > 0
      ? bench
          .slice()
          .sort((a, b) => Number(b.consumption) - Number(a.consumption))
          .map(
            (b) =>
              `${b.track}昨日大盘消耗 ${(Number(b.consumption) / 10000).toFixed(0)} 万，留资成本 ${b.lead_cost} 元，环比 ${Number(b.wow) >= 0 ? "+" : ""}${(Number(b.wow) * 100).toFixed(1)}%，热度 ${"🔥".repeat(Number(b.heat) || 1)}`,
          )
      : [
          "教育行业 Q3 信息流 CPM 环比 -6%，预算可多铺 1 个在投计划",
          "竞品「职上」新上『0 元试学』落地页，留资成本下降约 18%",
          "小红书新增『本地生活教育』流量池，兴趣教育获量红利期",
        ];

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)", letterSpacing: "-.01em" }}>
          工作台总览
        </h1>
        <span className="badge">
          数据来源：{kpis.source === "neon" ? "Neon Postgres" : "本地样本 CSV"}
        </span>
      </div>

      <div className="kpis">
        <div className="card kpi"><div className="n">{kpis.accounts}</div><div className="l">客户总数</div></div>
        <div className="card kpi"><div className="n">{kpis.activeCampaigns}</div><div className="l">在投计划</div></div>
        <div className="card kpi"><div className="n">{kpis.leads}</div><div className="l">线索总数</div></div>
        <div className="card kpi"><div className="n">{kpis.tasks}</div><div className="l">待办事项</div></div>
        <div className="card kpi"><div className="n danger">{kpis.urgent}</div><div className="l">紧急待办</div></div>
        <div className="card kpi"><div className="n">{kpis.contacts}</div><div className="l">关键人数</div></div>
        <div className="card kpi"><div className="n">{kpis.creatives}</div><div className="l">素材数</div></div>
        <div className="card kpi"><div className="n">{kpis.runs}</div><div className="l">Agent 运行</div></div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        {/* 业绩 + 今日3件事 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>我的业绩</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>在投目标分布</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
              <div style={{ width: 132, height: 132, borderRadius: "50%", background: `conic-gradient(${pieStops})`, flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {objEntries.map(([o, n]) => (
                  <div key={o} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: objColors[o] || "#cbd5e1" }} />
                    <span style={{ color: "var(--ink)" }}>{o}</span>
                    <span style={{ color: "var(--muted)" }}>{n} 个</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>今日 3 件事</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>按紧急度排序</span></div>
            <ol style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 10 }}>
              {top3.map((t, i) => (
                <li key={i} style={{ fontSize: 14 }}>
                  <span className="strong">{String(t.title)}</span>
                  <div style={{ marginTop: 3, display: "flex", gap: 8, alignItems: "center" }}>
                    {urgencyTag(t.urgency)}
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>截止 {String(t.deadline)}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* 关键变化 + 行业动态 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="card">
            <div className="card-head"><h3>关键变化</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>实时衍生</span></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {changes.map((c, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14 }}>
                  <span style={{ color: "var(--muted)" }}>{c.k}</span>
                  <span className="strong" style={{ color: c.c === "danger" ? "var(--danger)" : c.c === "warn" ? "var(--warn)" : "var(--ink)" }}>{c.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>行业动态</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>行业监测 Agent 生成</span></div>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13.5, color: "var(--ink)", lineHeight: 1.6 }}>
              {industry.map((t, i) => <li key={i}>{t}</li>)}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head"><h3>客户花名册</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>共 {accounts.length} 家</span></div>
          <table className="tbl">
            <thead><tr><th>客户</th><th>赛道</th><th>阶段</th><th>消耗(万)</th><th>健康度</th></tr></thead>
            <tbody>
              {accounts.slice(0, 10).map((a, i) => (
                <tr key={i}>
                  <td className="strong">{String(a.name)}</td>
                  <td>{String(a.track)}</td>
                  <td>{String(a.stage)}</td>
                  <td>{String(a.spend)}</td>
                  <td className={healthClass(a.health)}>{String(a.health)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><h3>在投投放计划</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>共 {activeCampaigns.length} 个</span></div>
          <table className="tbl">
            <thead><tr><th>计划</th><th>目标</th><th>状态</th></tr></thead>
            <tbody>
              {activeCampaigns.slice(0, 10).map((c, i) => (
                <tr key={i}>
                  <td className="strong">{String(c.name)}</td>
                  <td><span className="tag">{String(c.objective)}</span></td>
                  <td><span className="tag ok">{String(c.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head"><h3>待办事项</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>共 {todoTasks.length} 项</span></div>
          <table className="tbl">
            <thead><tr><th>待办</th><th>紧急度</th><th>截止</th></tr></thead>
            <tbody>
              {todoTasks.slice(0, 8).map((t, i) => (
                <tr key={i}>
                  <td className="strong">{String(t.title)}</td>
                  <td>{urgencyTag(t.urgency)}</td>
                  <td>{String(t.deadline)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-head"><h3>最新线索</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>共 {leads.length} 条</span></div>
          <table className="tbl">
            <thead><tr><th>线索</th><th>赛道</th><th>状态</th></tr></thead>
            <tbody>
              {leads.slice(0, 8).map((l, i) => (
                <tr key={i}>
                  <td className="strong">{String(l.name)}</td>
                  <td>{String(l.track)}</td>
                  <td><span className="tag">{String(l.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
