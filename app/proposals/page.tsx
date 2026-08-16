import { getProposals, getAccounts } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function statusTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("采纳")) return <span className="tag ok">{v}</span>;
  return <span className="tag warn">{v}</span>;
}

export default async function ProposalsPage() {
  const [proposals, accounts] = await Promise.all([getProposals(), getAccounts()]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>提案 / 复盘</h1>
        <span className="badge">共 {proposals.length} 份</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {proposals.map((p, i) => {
          const accName = nameOf[String(p.account_id)] ?? p.account_id;
          const ctx = [
            `客户：${accName}`,
            `类型：${p.type}`,
            `主题：${p.theme}`,
            `现有内容：${p.content}`,
            `预算：${p.budget} 元`,
          ].join("\n");
          return (
            <div className="card" key={i}>
              <div className="card-head">
                <div>
                  <h3 style={{ margin: 0 }}>{String(p.title)}</h3>
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>
                    {accName} · {String(p.type)} · v{String(p.version)}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span className="tag">{String(p.budget)} 元</span>
                  {statusTag(p.status)}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, marginBottom: 4 }}>
                一句话主题
              </div>
              <div style={{ fontSize: 13.5, color: "var(--ink)", marginBottom: 10 }}>{String(p.theme)}</div>

              <div style={{ fontSize: 12.5, color: "var(--primary)", fontWeight: 600, marginBottom: 4 }}>
                方案内容
              </div>
              <div className="gen-out" style={{ marginTop: 0 }}>{String(p.content)}</div>

              <div style={{ marginTop: 12, borderTop: "1px solid var(--line)", paddingTop: 12 }}>
                <Generator type="proposal" context={ctx} label="✨ AI 优化这份提案" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
