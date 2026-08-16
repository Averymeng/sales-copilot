import { getLeads } from "@/lib/db";

export default async function LeadsPage() {
  const leads = await getLeads();
  return (
    <div>
      <div className="card-head"><h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>商机线索</h1>
        <span className="badge">共 {leads.length} 条</span></div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>线索</th><th>赛道</th><th>预算预估</th><th>热度</th><th>状态</th></tr></thead>
          <tbody>
            {leads.map((l, i) => (
              <tr key={i}>
                <td className="strong">{String(l.name)}</td>
                <td>{String(l.track)}</td>
                <td>{String(l.budget_est)}</td>
                <td>{String(l.heat)}</td>
                <td><span className="tag">{String(l.status)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
