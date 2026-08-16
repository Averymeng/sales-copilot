import { getCampaigns, getAccounts } from "@/lib/db";

export default async function CampaignsPage() {
  const [campaigns, accounts] = await Promise.all([getCampaigns(), getAccounts()]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  return (
    <div>
      <div className="card-head"><h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>客户投放</h1>
        <span className="badge">共 {campaigns.length} 个计划</span></div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>计划</th><th>客户</th><th>目标</th><th>开始</th><th>状态</th></tr></thead>
          <tbody>
            {campaigns.map((c, i) => (
              <tr key={i}>
                <td className="strong">{String(c.name)}</td>
                <td>{String(nameOf[String(c.account_id)] ?? c.account_id)}</td>
                <td><span className="tag">{String(c.objective)}</span></td>
                <td>{String(c.start_date)}</td>
                <td><span className="tag ok">{String(c.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
