import { getReports, getAccounts, getCampaigns, getCampaignMetrics } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

export default async function ReportsPage() {
  const [reports, accounts, campaigns, metrics] = await Promise.all([
    getReports(),
    getAccounts(),
    getCampaigns(),
    getCampaignMetrics(),
  ]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  // 为每个有投放数据的客户生成复盘上下文
  const accCtx: { id: string; name: string; ctx: string }[] = [];
  for (const a of accounts) {
    const aid = String(a.id);
    const cps = campaigns.filter((c) => String(c.account_id) === aid);
    const ms = metrics.filter((m) => String(m.account_id) === aid);
    if (ms.length === 0 && cps.length === 0) continue;
    const spend = ms.reduce((s, m) => s + num(m.spend), 0);
    const leads = ms.reduce((s, m) => s + num(m.lead_count), 0);
    const imp = ms.reduce((s, m) => s + num(m.impressions), 0);
    const clk = ms.reduce((s, m) => s + num(m.clicks), 0);
    const ctr = imp ? clk / imp : 0;
    const ctx = [
      `客户：${a.name}（${a.track}）`,
      `在投计划：${cps.map((c) => `${c.name}[${c.status}]`).join("、") || "无"}`,
      `累计消耗：${spend} 元，留资：${leads}，点击率：${(ctr * 100).toFixed(2)}%`,
      `健康度：${a.health}`,
    ].join("\n");
    accCtx.push({ id: aid, name: String(a.name), ctx });
  }

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>报告 · 复盘</h1>
        <span className="badge">值守 Agent 早报 / 周复盘</span>
      </div>

      <div className="card">
        <div className="card-head"><h3>已有报告</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>{reports.length} 份</span></div>
        {reports.length === 0 ? (
          <div className="empty">暂无报告，用下方按钮生成</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {reports
              .slice()
              .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
              .map((r, i) => (
                <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                      {nameOf[String(r.account_id)] ?? r.account_id} · {String(r.type)}
                    </span>
                    <span style={{ fontSize: 11.5, color: "var(--muted)" }}>
                      {String(r.generated_by)} · {String(r.created_at).slice(0, 10)}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--body)", marginTop: 6, lineHeight: 1.6 }}>{String(r.content)}</div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <h3>一键生成周复盘</h3>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>生成结果自动写入报告库</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {accCtx.slice(0, 12).map((x, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "10px 12px" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{x.name}</div>
              <Generator type="report" context={x.ctx} accountId={x.id} label="✨ 生成周复盘" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
