import { getAccounts } from "@/lib/db";

function healthClass(v: unknown): string {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("danger")) return "h-danger";
  if (s.includes("预警") || s.includes("未")) return "h-warn";
  if (s.includes("健康") || s.includes("normal")) return "h-ok";
  return "";
}

export default async function AccountsPage() {
  const accounts = await getAccounts();
  return (
    <div>
      <div className="card-head"><h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>客户档案</h1>
        <span className="badge">共 {accounts.length} 家</span></div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>客户</th><th>赛道</th><th>产品</th><th>城市</th><th>阶段</th><th>消耗(万)</th><th>预算(万)</th><th>健康度</th></tr></thead>
          <tbody>
            {accounts.map((a, i) => (
              <tr key={i}>
                <td className="strong">{String(a.name)}</td>
                <td>{String(a.track)}</td>
                <td>{String(a.product)}</td>
                <td>{String(a.city)}</td>
                <td>{String(a.stage)}</td>
                <td>{String(a.spend)}</td>
                <td>{String(a.budget)}</td>
                <td className={healthClass(a.health)}>{String(a.health)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
