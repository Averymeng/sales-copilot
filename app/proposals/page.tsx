import { getProposals, getAccounts } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function statusTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("采纳")) return <span className="badge ok">{v}</span>;
  return <span className="badge terra">{v}</span>;
}

export default async function ProposalsPage() {
  const [proposals, accounts] = await Promise.all([getProposals(), getAccounts()]);
  const nameOf: Record<string, string> = {};
  accounts.forEach((a) => (nameOf[String(a.id)] = String(a.name)));

  return (
    <div>
      <header className="topbar">
        <div><h1>提案与复盘</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="toolbar" style={{ marginBottom: 18 }}>
          <span className="badge blue">共 {proposals.length} 份提案</span>
          <button className="btn btn-primary btn-sm">＋ 新建提案</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
                <div className="ch">
                  <h3>{String(p.title)}</h3>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="badge">{String(p.budget)} 元</span>
                    {statusTag(p.status)}
                  </div>
                </div>
                <div className="note" style={{ marginTop: -6 }}>{accName} · {String(p.type)} · v{String(p.version)}</div>

                <div style={{ marginTop: 14 }}>
                  <span className="sec-tag">一句话主题</span>
                  <div style={{ fontSize: 14, color: "var(--ink)", marginTop: 6 }}>{String(p.theme)}</div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <span className="sec-tag">方案内容</span>
                  <div className="gen-out" style={{ marginTop: 8 }}>{String(p.content)}</div>
                </div>

                <div style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                  <Generator type="proposal" context={ctx} label="✨ AI 优化这份提案" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
