import { getKnowledgeBase, getKnowledgePersonal } from "@/lib/db";
export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  const [kb, kp] = await Promise.all([getKnowledgeBase(), getKnowledgePersonal()]);

  return (
    <div>
      <div className="card-head" style={{ marginBottom: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>知识库</h1>
        <span className="badge">平台规则 + 个人沉淀</span>
      </div>

      <div className="card">
        <div className="card-head"><h3>📘 平台规则 / 行业知识</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>{kb.length} 条</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {kb.map((k, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{String(k.title)}</span>
                <span className="tag">{String(k.tag)}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--body)", marginTop: 6, lineHeight: 1.6 }}>{String(k.content)}</div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 6 }}>来源：{String(k.source)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><h3>🧠 我的个人沉淀</h3><span style={{ color: "var(--muted)", fontSize: 12 }}>{kp.length} 条</span></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {kp.map((k, i) => (
            <div key={i} style={{ border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px", background: "#FBFAFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600, color: "var(--ink)" }}>{String(k.title)}</span>
                <span className="tag ok">{String(k.tag)}</span>
              </div>
              <div style={{ fontSize: 13, color: "var(--body)", marginTop: 6, lineHeight: 1.6 }}>{String(k.content)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
