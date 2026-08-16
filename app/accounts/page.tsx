import Link from "next/link";
import { getAccounts, getContacts, getCampaigns, getFollowups, getEvents } from "@/lib/db";
export const dynamic = "force-dynamic";

const GRAD = [
  "linear-gradient(135deg,var(--accent),var(--violet))",
  "linear-gradient(135deg,var(--terra),#E0A878)",
  "linear-gradient(135deg,var(--ok),#8E85C7)",
  "linear-gradient(135deg,var(--violet),var(--deep))",
  "linear-gradient(135deg,#564B58,#938BA0)",
];

function healthClass(v: unknown): "ok" | "warn" {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("预警") || s.includes("未")) return "warn";
  return "ok";
}
function stageClass(v: unknown): "pre" | "on" {
  return String(v || "").includes("预合作") ? "pre" : "on";
}
function power(v: unknown) {
  const s = String(v || "");
  if (s.includes("决策")) return <span className="badge danger">决策人</span>;
  if (s.includes("影响")) return <span className="badge terra">影响者</span>;
  return <span className="badge">{s}</span>;
}

export default async function AccountsPage() {
  const [accounts, contacts, campaigns, followups, events] = await Promise.all([
    getAccounts(), getContacts(), getCampaigns(), getFollowups(), getEvents(),
  ]);

  const preCount = accounts.filter((a) => stageClass(a.stage) === "pre").length;

  return (
    <div>
      <header className="topbar">
        <div><h1>我的客户</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="toolbar" style={{ marginBottom: 16 }}>
          <button className="btn btn-primary btn-sm">＋ 新建客户</button>
          <span className="badge blue">共 {accounts.length} 个客户</span>
          <span className="badge">全部阶段</span>
          <span className="badge terra">预合作 {preCount} · 已有 {accounts.length - preCount}</span>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm">按消耗排序</button>
        </div>

        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {accounts.map((a, i) => {
            const aid = String(a.id);
            const cs = contacts.filter((c) => String(c.account_id) === aid);
            const cps = campaigns.filter((c) => String(c.account_id) === aid);
            const fus = followups
              .filter((f) => String(f.account_id) === aid)
              .sort((x, y) => String(y.date).localeCompare(String(x.date)));
            const evs = events.filter((e) => String(e.related_account) === String(a.name));
            const spend = Number(a.spend || 0);
            return (
              <div key={i}>
                <div className="row">
                  <div className="av-sq" style={{ background: GRAD[i % GRAD.length] }}>
                    {String(a.name).slice(0, 1)}
                  </div>
                  <div className="info">
                    <div className="nm">
                      {String(a.name)}
                      <span className={`stage ${stageClass(a.stage)}`}>{String(a.stage)}</span>
                    </div>
                    <div className="sb">{String(a.track)} · {String(a.city)}</div>
                  </div>
                  <div className="num">消耗<b>{spend > 0 ? `¥${spend}万` : "—"}</b></div>
                  <div className={`health ${healthClass(a.health)}`}>
                    {spend > 0 ? String(a.health) : "未建投放"}
                  </div>
                  <div className="acts">
                    <Link href={`/accounts#client-${aid}`} className="btn btn-soft btn-sm">档案</Link>
                    <Link href="/campaigns" className="btn btn-ghost btn-sm">投放</Link>
                  </div>
                </div>

                {/* 客户档案详情 */}
                <div id={`client-${aid}`} style={{ padding: "0 18px 22px", borderTop: "1px solid var(--border)" }}>
                  <div className="grid cols-3" style={{ gridTemplateColumns: "1.5fr 1fr", gap: 20, alignItems: "start", marginTop: 20 }}>
                    <div>
                      <div className="card" style={{ marginBottom: 20 }}>
                        <div className="ch"><h3>客户档案</h3><span className={`stage ${stageClass(a.stage)}`}>{String(a.stage)}</span></div>
                        <div className="kv">
                          <div className="it"><div className="k">所属赛道</div><div className="v">{String(a.track)}</div></div>
                          <div className="it"><div className="k">主推产品</div><div className="v">{String(a.product)}</div></div>
                          <div className="it"><div className="k">城市</div><div className="v">{String(a.city)}</div></div>
                          <div className="it"><div className="k">阶段</div><div className="v">{String(a.stage)}</div></div>
                          <div className="it"><div className="k">累计消耗</div><div className="v">{spend > 0 ? `¥${spend}万` : "—"}</div></div>
                          <div className="it"><div className="k">预算</div><div className="v">{String(a.budget)}</div></div>
                        </div>
                      </div>
                      <div className="card">
                        <div className="ch"><h3>跟进合作情况</h3><span className="badge blue">时间线</span></div>
                        {fus.length + evs.length === 0 ? (
                          <div className="empty" style={{ padding: 24 }}>暂无跟进记录</div>
                        ) : (
                          <div className="tl">
                            {fus.map((f, j) => (
                              <div className="it" key={"f" + j}>
                                <div className="dot accent" />
                                <div className="tx">
                                  <div className="t">{String(f.date)} · {String(f.type)}</div>
                                  <div className="d">{String(f.summary)} → 下一步：{String(f.next_action)}</div>
                                </div>
                              </div>
                            ))}
                            {evs.map((e, j) => (
                              <div className="it" key={"e" + j}>
                                <div className="dot violet" />
                                <div className="tx">
                                  <div className="t">{String(e.date)} · {String(e.type)}</div>
                                  <div className="d">{String(e.title)} {String(e.note)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="card" style={{ marginBottom: 20 }}>
                        <div className="ch"><h3>关键人 ({cs.length})</h3></div>
                        {cs.length === 0 ? (
                          <div className="empty" style={{ padding: 20 }}>暂无关键人</div>
                        ) : (
                          <table className="table" style={{ fontSize: 13 }}>
                            <thead><tr><th>姓名</th><th>职位</th><th>决策力</th></tr></thead>
                            <tbody>
                              {cs.map((c, j) => (
                                <tr key={j}>
                                  <td className="strong">{String(c.name)}</td>
                                  <td>{String(c.title)}</td>
                                  <td>{power(c.decision_power)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      <div className="card">
                        <div className="ch"><h3>投放计划 ({cps.length})</h3></div>
                        {cps.length === 0 ? (
                          <div className="empty" style={{ padding: 20 }}>暂未建投放</div>
                        ) : (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {cps.map((c, j) => (
                              <span key={j} className="badge ok" style={{ fontSize: 12.5 }}>
                                {String(c.name)} · {String(c.objective)} · {String(c.status)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="note" style={{ marginTop: 14, textAlign: "center" }}>
          预合作客户：已从线索池加入档案、推进拜访中，暂未建投放；点击「投放」查看空态引导。
        </p>
      </div>
    </div>
  );
}
