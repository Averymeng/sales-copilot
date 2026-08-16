import { getAccounts, getContacts, getCampaigns, getFollowups, getEvents } from "@/lib/db";

function healthClass(v: unknown): string {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("danger")) return "h-danger";
  if (s.includes("预警") || s.includes("未")) return "h-warn";
  if (s.includes("健康") || s.includes("normal")) return "h-ok";
  return "";
}
function power(v: unknown) {
  const s = String(v || "");
  if (s.includes("决策")) return <span className="tag danger">决策人</span>;
  if (s.includes("影响")) return <span className="tag warn">影响者</span>;
  return <span className="tag">{s}</span>;
}

export default async function AccountsPage() {
  const [accounts, contacts, campaigns, followups, events] = await Promise.all([
    getAccounts(), getContacts(), getCampaigns(), getFollowups(), getEvents(),
  ]);

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)", letterSpacing: "-.01em" }}>客户档案</h1>
        <span className="badge">{accounts.length} 家 · 客户手册</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {accounts.map((a, i) => {
          const aid = String(a.id);
          const cs = contacts.filter((c) => String(c.account_id) === aid);
          const cps = campaigns.filter((c) => String(c.account_id) === aid);
          const fus = followups
            .filter((f) => String(f.account_id) === aid)
            .sort((x, y) => String(y.date).localeCompare(String(x.date)));
          const evs = events.filter((e) => String(e.related_account) === String(a.name));
          return (
            <div className="card" key={i}>
              <div className="card-head">
                <h3 style={{ margin: 0 }}>{String(a.name)}</h3>
                <span className={healthClass(a.health)} style={{ fontSize: 12 }}>{String(a.health)}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px,1fr))", gap: 12, margin: "6px 0 14px" }}>
                <Field k="赛道" v={String(a.track)} />
                <Field k="产品" v={String(a.product)} />
                <Field k="城市" v={String(a.city)} />
                <Field k="阶段" v={String(a.stage)} />
                <Field k="消耗(万)" v={String(a.spend)} />
                <Field k="预算(万)" v={String(a.budget)} />
              </div>

              <Section title={`关键人 (${cs.length})`}>
                {cs.length === 0 ? <Empty /> : (
                  <table className="tbl">
                    <thead><tr><th>姓名</th><th>职位</th><th>决策力</th><th>渠道</th><th>风格</th></tr></thead>
                    <tbody>
                      {cs.map((c, j) => (
                        <tr key={j}>
                          <td className="strong">{String(c.name)}</td>
                          <td>{String(c.title)}</td>
                          <td>{power(c.decision_power)}</td>
                          <td>{String(c.comm_channel)}</td>
                          <td>{String(c.comm_style)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Section>

              <Section title={`投放计划 (${cps.length})`}>
                {cps.length === 0 ? <Empty /> : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {cps.map((c, j) => (
                      <span key={j} className="tag ok" style={{ fontSize: 12.5 }}>
                        {String(c.name)} · {String(c.objective)} · {String(c.status)}
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              <Section title={`跟进时间线 (${fus.length + evs.length})`}>
                {fus.length + evs.length === 0 ? <Empty /> : (
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 8, fontSize: 13, lineHeight: 1.55 }}>
                    {fus.map((f, j) => (
                      <li key={"f" + j}><b style={{ color: "var(--ink)" }}>{String(f.date)}</b> ｜ {String(f.type)}：{String(f.summary)} <span style={{ color: "var(--muted)" }}>→ 下一步：{String(f.next_action)}</span></li>
                    ))}
                    {evs.map((e, j) => (
                      <li key={"e" + j}><b style={{ color: "var(--ink)" }}>{String(e.date)}</b> ｜ {String(e.type)}：{String(e.title)} <span style={{ color: "var(--muted)" }}>{String(e.note)}</span></li>
                    ))}
                  </ul>
                )}
              </Section>
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
      <div style={{ fontSize: 13.5, color: "var(--ink)", marginTop: 2 }}>{v}</div>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", margin: "10px 0 6px" }}>{title}</div>
      {children}
    </div>
  );
}
function Empty() {
  return <div style={{ fontSize: 12.5, color: "var(--muted)" }}>暂无数据</div>;
}
