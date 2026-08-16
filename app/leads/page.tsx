import { getLeads, getAccounts } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function heatDots(h: unknown) {
  const n = Number(h) || 1;
  return "🔥".repeat(Math.min(3, Math.max(1, n)));
}
function statusTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("已转")) return <span className="badge ok">{v}</span>;
  return <span className="badge terra">{v}</span>;
}

export default async function LeadsPage() {
  const [leads, accounts] = await Promise.all([getLeads(), getAccounts()]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  const converted = leads.filter((l) => String(l.status).includes("已转")).length;

  return (
    <div>
      <header className="topbar">
        <div><h1>新客开拓</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="toolbar" style={{ marginBottom: 18 }}>
          <span className="badge blue">共 {leads.length} 条线索</span>
          <span className="badge ok">已转化 {converted}</span>
          <span className="badge terra">商机发现 Agent 实时捕获</span>
        </div>

        <div className="grid cols-2">
          {leads.map((l, i) => {
            const hasReport = l.research_report && String(l.research_report).trim().length > 0;
            const ctx = [
              `线索：${l.name}`,
              `赛道：${l.track}　产品：${l.product}`,
              `预算预估：${l.budget_est} 元　热度：${heatDots(l.heat)}`,
              `信号：${l.signal}`,
              l.source_url ? `来源：${l.source_url}` : "",
              l.account_id ? `关联客户：${nameOf[String(l.account_id)] ?? l.account_id}` : "（尚未转化）",
            ].filter(Boolean).join("\n");
            return (
              <div className="card" key={i}>
                <div className="ch">
                  <h3>{String(l.name)} <span style={{ fontSize: 13 }}>{heatDots(l.heat)}</span></h3>
                  {statusTag(l.status)}
                </div>
                <div className="note" style={{ marginTop: -6 }}>
                  {String(l.track)} · {String(l.product)} · 预算预估 {String(l.budget_est)}
                </div>
                <div className="diag terra" style={{ marginTop: 12 }}>
                  🔥 信号：{String(l.signal || "—")}
                </div>
                {hasReport ? (
                  <div style={{ marginTop: 12 }}>
                    <div className="ch" style={{ marginTop: 4 }}><h3 style={{ fontSize: 14 }}>AI 调研报告</h3><span className="badge blue">商机发现 Agent</span></div>
                    <div className="gen-out" style={{ marginTop: 8 }}>{String(l.research_report)}</div>
                  </div>
                ) : (
                  <div style={{ marginTop: 12 }}>
                    <Generator type="research" context={ctx} label="✨ 一键生成调研报告" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
