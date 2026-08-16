import { getCampaigns, getAccounts, getCampaignMetrics, getCreatives } from "@/lib/db";
import Generator from "@/components/Generator";
import CampaignFilter from "@/components/CampaignFilter";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

export default async function CampaignsPage() {
  const [campaigns, accounts, metrics, creatives] = await Promise.all([
    getCampaigns(), getAccounts(), getCampaignMetrics(), getCreatives(),
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
    return { c, spend, leads, imp, clk, ctr: imp ? clk / imp : 0, leadCost: leads ? spend / leads : 0, feed, search, cs };
  });

  const clients = [...new Set(per.map((p) => nameOf[String(p.c.account_id)] ?? String(p.c.account_id)))];
  const stages = [...new Set(per.map((p) => String(p.c.stage)))];

  return (
    <div>
      <header className="topbar">
        <div><h1>客户投放</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <CampaignFilter clients={clients} stages={stages} />

        {per.length === 0 && (
          <div className="ambient">
            <div className="amb-ico">📊</div>
            <h3>还没有投放数据</h3>
            <p>客户档案中暂无小红书投放计划。先推进拜访、生成首份提案，确认合作后由投放团队建户起量。</p>
          </div>
        )}

        <div>
          {per.map(({ c, spend, leads, imp, clk, ctr, leadCost, feed, search, cs }, i) => {
            const cid = String(c.id);
            const accId = String(c.account_id);
            const accName = nameOf[accId] ?? accId;
            const total = feed + search || 1;
            const feedPct = Math.round((feed / total) * 100);
            const ctx = [
              `计划：${c.name}`,
              `客户：${accName}`,
              `目标：${c.objective}　状态：${c.status}`,
              `累计消耗：${spend} 元，留资：${leads}，点击率：${(ctr * 100).toFixed(2)}%，留资成本：${leadCost ? leadCost.toFixed(1) : "—"} 元`,
              `版位消耗：信息流 ${feed} / 搜索 ${search}`,
              cs.length ? `现有素材：${cs.map((x) => x.title).join("、")}` : "暂无素材",
            ].join("\n");
            const diagCtx = ctx + `\n健康度建议：信息流留资成本偏高，建议优化封面钩子与落地页首屏；搜索版位效率更优，建议扩词加预算。`;
            const reportCtx = `客户：${accName}\n在投计划：${c.name}[${c.status}]\n累计消耗：${spend} 元，留资：${leads}，点击率：${(ctr * 100).toFixed(2)}%，留资成本：${leadCost ? leadCost.toFixed(1) : "—"} 元\n版位：信息流 ${feed} / 搜索 ${search}`;

            return (
              <div key={i} className="cf-detail" data-client={accName} data-stage={String(c.stage)} style={{ marginBottom: 24 }}>
                {/* KPI row */}
                <div className="kpi-row" style={{ marginBottom: 20 }}>
                  <div className="card"><div className="kpi"><div className="lbl">累计消耗</div><div className="val sm">{spend.toLocaleString()}</div></div></div>
                  <div className="card"><div className="kpi"><div className="lbl">留资数</div><div className="val sm">{leads.toLocaleString()}</div></div></div>
                  <div className="card"><div className="kpi"><div className="lbl">点击率</div><div className="val sm">{(ctr * 100).toFixed(2)}%</div></div></div>
                  <div className="card"><div className="kpi"><div className="lbl">留资成本</div><div className="val sm">{leadCost ? `${leadCost.toFixed(1)} 元` : "—"}</div></div></div>
                  <div className="card"><div className="kpi"><div className="lbl">在投版位</div><div className="val sm">{feed > 0 ? "信息流" : ""}{feed > 0 && search > 0 ? "+" : ""}{search > 0 ? "搜索" : ""}</div></div></div>
                </div>

                <div className="grid cols-3" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }}>
                  <div>
                    {/* 版位对比 */}
                    <div className="card" style={{ marginBottom: 20 }}>
                      <div className="ch"><h3>版位对比 · 信息流 vs 搜索</h3><span className="badge violet">累计</span></div>
                      <table className="table" style={{ fontSize: 13 }}>
                        <thead><tr><th>版位</th><th>消耗</th><th>占比</th><th>点击率</th><th>留资成本</th></tr></thead>
                        <tbody>
                          <tr><td className="strong">信息流</td><td>{feed.toLocaleString()}</td><td>{feedPct}%</td><td>{(imp ? (clk / imp) * 100 : 0).toFixed(1)}%</td><td className="delta down">{feed > 0 ? "偏高" : "—"}</td></tr>
                          <tr><td className="strong">搜索</td><td>{search.toLocaleString()}</td><td>{100 - feedPct}%</td><td>5.1%</td><td className="delta up">较优</td></tr>
                        </tbody>
                      </table>
                      <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "center" }}>
                        <div className="pie-sm">
                          <svg viewBox="0 0 36 36">
                            <circle className="bg" cx="18" cy="18" r="15.9" />
                            <circle className="fg" cx="18" cy="18" r="15.9" stroke="#5B5BD8" strokeDasharray={`${feedPct} ${100 - feedPct}`} />
                          </svg>
                          <div className="ctr">{feedPct}%</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="note">信息流占比 {feedPct}%，但 CPL 偏高。建议将 15–20% 预算从信息流转移至搜索版位。</div>
                        </div>
                      </div>
                    </div>

                    {/* 素材库 */}
                    <div className="card" style={{ marginBottom: 20 }}>
                      <div className="ch"><h3>投放素材库</h3><span className="badge violet">{cs.length} 条在投</span></div>
                      {cs.length === 0 ? (
                        <div className="empty" style={{ padding: 24 }}>暂无素材</div>
                      ) : (
                        cs.map((x, j) => (
                          <div className="mat-card" key={j}>
                            <div className={`mat-cover g${(j % 5) + 1}`}>
                              <span className="tag">{String(x.placement)}</span>
                              <span className="tt">{String(x.title)}</span>
                            </div>
                            <div className="mat-info">
                              <div className="t">{String(x.title)}</div>
                              <div className="d">{String(x.type)} · {String(x.placement)}</div>
                              <div className="mat-stats">
                                <div className="ms">点击率 <b>{(num(x.ctr) * 100).toFixed(1)}%</b></div>
                                <div className="ms">留资 <b>{String(x.leads)}</b></div>
                                <div className="ms">复用 <b>{String(x.reuse_count)}</b></div>
                              </div>
                            </div>
                            <button className="btn btn-ghost btn-sm" style={{ alignSelf: "center" }}>复用</button>
                          </div>
                        ))
                      )}
                      <Generator type="copy" context={ctx} label="✨ AIGC 生成新素材" />
                    </div>

                    {/* 智能诊断 */}
                    <div className="card">
                      <div className="ch"><h3>智能诊断</h3><span className="badge terra">建议</span></div>
                      <div className="li"><div className="ic terra">!</div><div className="tx"><div className="t">信息流留资成本偏高</div><div className="d">主因按钮点击率下滑，建议优化封面钩子文案并 A/B 测试落地页首屏。</div></div></div>
                      <div className="li"><div className="ic violet">✦</div><div className="tx"><div className="t">搜索版位效率更优，可加预算</div><div className="d">建议扩词至「冲刺 / 大纲解读 / 择校」，提升出价 10%。</div></div></div>
                      <Generator type="diagnose" context={diagCtx} label="📋 生成完整优化诊断" />
                    </div>
                  </div>

                  <div>
                    {/* 账户概览 */}
                    <div className="card" style={{ marginBottom: 20 }}>
                      <div className="ch"><h3>账户概览</h3></div>
                      <div className="kv">
                        <div className="it"><div className="k">客户</div><div className="v">{accName}</div></div>
                        <div className="it"><div className="k">目标</div><div className="v">{String(c.objective)}</div></div>
                        <div className="it"><div className="k">状态</div><div className="v">{String(c.status)}</div></div>
                        <div className="it"><div className="k">投放周期</div><div className="v">{String(c.start_date)} 至今</div></div>
                      </div>
                    </div>

                    {/* 一键生成 */}
                    <div className="card" style={{ marginBottom: 20 }}>
                      <div className="ch"><h3>一键生成</h3></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <Generator type="report" accountId={Number(accId)} context={reportCtx} label="📑 生成周复盘" />
                        <Generator type="proposal" context={ctx} label="📄 生成提案" />
                      </div>
                    </div>

                    {/* 快捷操作 */}
                    <div className="card">
                      <div className="ch"><h3>快捷操作</h3></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <button className="btn btn-soft btn-block">📊 导出数据报表</button>
                        <button className="btn btn-soft btn-block">📝 添加到待办</button>
                        <button className="btn btn-soft btn-block">💬 询问 AI 优化建议</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
