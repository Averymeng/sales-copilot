import { getLeads, getAccounts } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function heatDots(h: unknown) {
  const n = Number(h) || 1;
  return "🔥".repeat(Math.min(3, Math.max(1, n)));
}
function statusTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("已转")) return <span className="tag ok">{v}</span>;
  return <span className="tag warn">{v}</span>;
}

export default async function LeadsPage() {
  const [leads, accounts] = await Promise.all([getLeads(), getAccounts()]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  const converted = leads.filter((l) => String(l.status).includes("已转")).length;

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>商机线索 · 新客开拓</h1>
        <span className="badge">{leads.length} 条 · 已转 {converted}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {leads.map((l, i) => {
          const lid = String(l.id);
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
              <div className="card-head">
                <div>
                  <h3 style={{ margin: 0 }}>{String(l.name)} <span style={{ fontSize: 13 }}>{heatDots(l.heat)}</span></h3>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {String(l.track)} · {String(l.product)} · 预算 {String(l.budget_est)}
                  </span>
                </div>
                {statusTag(l.status)}
              </div>

              <div style={{ background: "#FFF8F1", border: "1px solid #FBE5CF", borderRadius: 10, padding: "10px 12px", fontSize: 13, color: "var(--ink)", marginTop: 4 }}>
                🔥 信号：{String(l.signal || "—")}
              </div>

              {hasReport ? (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary)", marginBottom: 6 }}>AI 调研报告</div>
                  <div className="gen-out" style={{ marginTop: 0 }}>{String(l.research_report)}</div>
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
  );
}
