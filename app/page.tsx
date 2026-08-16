import { getOverview } from "@/lib/db";

function healthClass(v: unknown): string {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("danger")) return "h-danger";
  if (s.includes("预警") || s.includes("未")) return "h-warn";
  if (s.includes("健康") || s.includes("normal")) return "h-ok";
  return "";
}

export default async function HomePage() {
  const { kpis, accounts, activeCampaigns, todoTasks, leads } = await getOverview();

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

      <div className="grid2">
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
                  <td>{String(t.urgency).includes("紧急") ? <span className="tag danger">紧急</span> : <span className="tag warn">{String(t.urgency)}</span>}</td>
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
