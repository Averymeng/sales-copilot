import { getCampaigns, getAccounts, getCampaignMetrics, getCreatives } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}
function statusTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("暂停")) return <span className="tag warn">{v}</span>;
  if (v.includes("结束")) return <span className="tag">{v}</span>;
  return <span className="tag ok">{v}</span>;
}

export default async function CampaignsPage() {
  const [campaigns, accounts, metrics, creatives] = await Promise.all([
    getCampaigns(),
    getAccounts(),
    getCampaignMetrics(),
    getCreatives(),
  ]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  const per = campaigns.map((c) => {
    const cid = String(c.id);
    const ms = metrics.filter((m) => String(m.campaign_id) === cid);
    const spend = ms.reduce((s, m) => s + num(m.spend), 0);
    const leads = ms.reduce((s, m) => s + num(m.lead_count), 0);
    const imp = ms.reduce((s, m) => s + num(m.impressions), 0);
    const clk = ms.reduce((s, m) => s + num(m.clicks), 0);
    const feed = ms.filter((m) => String(m.placement).includes("信息流")).reduce((s, m) => s + num(m.spend), 0);
    const search = ms.filter((m) => String(m.placement).includes("搜索")).reduce((s, m) => s + num(m.spend), 0);
    const cs = creatives.filter((cr) => String(cr.campaign_id) === cid);
    return {
      c,
      spend,
      leads,
      imp,
      clk,
      ctr: imp ? clk / imp : 0,
      leadCost: leads ? spend / leads : 0,
      feed,
      search,
      cs,
    };
  });

  const totalSpend = per.reduce((s, x) => s + x.spend, 0);
  const totalLeads = per.reduce((s, x) => s + x.leads, 0);
  const totalClk = per.reduce((s, x) => s + x.clk, 0);
  const totalImp = per.reduce((s, x) => s + x.imp, 0);
  const avgCtr = totalImp ? totalClk / totalImp : 0;
  const avgLeadCost = totalLeads ? totalSpend / totalLeads : 0;

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>客户投放</h1>
        <span className="badge">共 {campaigns.length} 个计划</span>
      </div>

      <div className="kpis" style={{ marginBottom: 18 }}>
        <div className="card kpi"><div className="n">{totalSpend.toLocaleString()}</div><div className="l">累计消耗(元)</div></div>
        <div className="card kpi"><div className="n">{totalLeads.toLocaleString()}</div><div className="l">累计留资</div></div>
        <div className="card kpi"><div className="n">{(avgCtr * 100).toFixed(2)}%</div><div className="l">平均点击率</div></div>
        <div className="card kpi"><div className="n">{avgLeadCost ? avgLeadCost.toFixed(1) : "—"}</div><div className="l">平均留资成本</div></div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {per.map(({ c, spend, leads, imp, clk, ctr, leadCost, feed, search, cs }, i) => {
          const cid = String(c.id);
          const total = feed + search || 1;
          const ctx = [
            `计划：${c.name}`,
            `客户：${nameOf[String(c.account_id)] ?? c.account_id}`,
            `目标：${c.objective}　状态：${c.status}`,
            `累计消耗：${spend} 元，留资：${leads}，点击率：${(ctr * 100).toFixed(2)}%，留资成本：${leadCost ? leadCost.toFixed(1) : "—"} 元`,
            `版位消耗：信息流 ${feed} / 搜索 ${search}`,
            cs.length ? `现有素材：${cs.map((x) => x.title).join("、")}` : "暂无素材",
          ].join("\n");
          return (
            <div className="card" key={i}>
              <div className="card-head">
                <div>
                  <h3 style={{ margin: 0 }}>{String(c.name)}</h3>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {nameOf[String(c.account_id)] ?? c.account_id} · {String(c.objective)} · 始于 {String(c.start_date)}
                  </span>
                </div>
                {statusTag(c.status)}
              </div>

              <div className="split">
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                    <Field k="消耗(元)" v={spend.toLocaleString()} />
                    <Field k="留资数" v={String(leads)} />
                    <Field k="点击率" v={`${(ctr * 100).toFixed(2)}%`} />
                    <Field k="留资成本" v={leadCost ? `${leadCost.toFixed(1)} 元` : "—"} />
                  </div>
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>版位消耗占比</div>
                    <div className="bar">
                      <span style={{ width: `${(feed / total) * 100}%`, background: "#6366f1" }} />
                      <span style={{ width: `${(search / total) * 100}%`, background: "#f97316" }} />
                    </div>
                    <div className="barrow" style={{ marginTop: 6 }}>
                      <span className="lbl">信息流</span>
                      <span className="val">{feed.toLocaleString()}</span>
                      <span className="lbl">搜索</span>
                      <span className="val">{search.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>
                    素材 ({cs.length})
                  </div>
                  {cs.length === 0 ? (
                    <div style={{ fontSize: 12.5, color: "var(--muted)" }}>暂无素材</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {cs.map((x, j) => (
                        <div key={j} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "8px 10px" }}>
                          <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{String(x.title)}</div>
                          <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 2 }}>
                            {String(x.type)} · {String(x.placement)} · CTR {(num(x.ctr) * 100).toFixed(2)}% · 留资 {String(x.leads)} · 复用 {String(x.reuse_count)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginTop: 14, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <Generator type="copy" context={ctx} label="✨ 一键生成广告文案" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>{k}</div>
      <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 2, fontWeight: 600 }}>{v}</div>
    </div>
  );
}
