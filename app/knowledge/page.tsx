import { getKnowledgeBase, getKnowledgePersonal } from "@/lib/db";
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [kb, kp] = await Promise.all([getKnowledgeBase(), getKnowledgePersonal()]);

  return (
    <div>
      <header className="topbar">
        <div><h1>知识库</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="toolbar" style={{ marginBottom: 18 }}>
          <span className="badge blue">平台规则 / 行业知识 {kb.length} 条</span>
          <span className="badge violet">我的个人沉淀 {kp.length} 条</span>
        </div>

        <div className="grid cols-2">
          <div className="card">
            <div className="ch"><h3>📘 平台规则 / 行业知识</h3></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {kb.map((k, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: "var(--r-md)", padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{String(k.title)}</span>
                    <span className="tag">{String(k.tag)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6, lineHeight: 1.6 }}>{String(k.content)}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 6 }}>来源：{String(k.source)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="ch"><h3>🧠 我的个人沉淀</h3></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {kp.map((k, i) => (
                <div key={i} style={{ border: "1px solid var(--border-2)", borderRadius: "var(--r-md)", padding: "12px 14px", background: "var(--surface-2)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontWeight: 600, color: "var(--ink)" }}>{String(k.title)}</span>
                    <span className="badge ok">{String(k.tag)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 6, lineHeight: 1.6 }}>{String(k.content)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
