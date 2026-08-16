import { getReports, getAccounts, getCampaigns, getCampaignMetrics } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

export default async function ReportsPage() {
  const [reports, accounts, campaigns, metrics] = await Promise.all([
    getReports(), getAccounts(), getCampaigns(), getCampaignMetrics(),
  ]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

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
      <header className="topbar">
        <div><h1>报告与复盘</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="ch"><h3>已有报告</h3><span className="badge">{reports.length} 份</span></div>
          {reports.length === 0 ? (
            <div className="empty">暂无报告，用下方按钮生成</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {reports
                .slice()
                .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
                .map((r, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 600, color: "var(--ink)" }}>
                        {nameOf[String(r.account_id)] ?? r.account_id} · {String(r.type)}
                      </span>
                      <span style={{ fontSize: 11.5, color: "var(--text-3)" }}>
                        {String(r.generated_by)} · {String(r.created_at).slice(0, 10)}
                      </span>
                    </div>
                    <div className="gen-out" style={{ marginTop: 8 }}>{String(r.content)}</div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="ch"><h3>一键生成周复盘</h3><span className="badge blue">生成结果自动写入报告库</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {accCtx.slice(0, 12).map((x, i) => (
              <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "10px 12px" }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>{x.name}</div>
                <Generator type="report" context={x.ctx} accountId={x.id} label="✨ 生成周复盘" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
