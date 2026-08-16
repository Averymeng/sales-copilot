import { getTasks } from "@/lib/db";
import Generator from "@/components/Generator";
export const dynamic = "force-dynamic";

function urgencyTag(u: unknown) {
  const s = String(u || "");
  if (s.includes("紧急")) return <span className="badge danger">紧急</span>;
  if (s.includes("节点")) return <span className="badge terra">节点</span>;
  if (s.includes("优化")) return <span className="badge ok">优化</span>;
  return <span className="badge">{s}</span>;
}
function sourceTag(s: unknown) {
  const v = String(s || "");
  if (v.includes("AI") || v.includes("监测")) return <span className="badge blue">AI监测</span>;
  return <span className="badge">{v}</span>;
}

export default async function TasksPage() {
  const tasks = await getTasks();
  const todo = tasks.filter((t) => !String(t.status).includes("完成"));
  const done = tasks.filter((t) => String(t.status).includes("完成"));
  const urgent = todo.filter((t) => String(t.urgency).includes("紧急"));

  const ctx = todo
    .map((t) => `- [${t.urgency}] ${t.title}（截止 ${t.deadline || "—"}，来源 ${t.source}）${t.detail ? "：" + t.detail : ""}`)
    .join("\n");

  return (
    <div>
      <header className="topbar">
        <div><h1>待办 / 日程</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="toolbar" style={{ marginBottom: 18 }}>
          <span className="badge blue">待办 {todo.length}</span>
          <span className="badge danger">紧急 {urgent.length}</span>
          <span className="badge ok">已完成 {done.length}</span>
        </div>

        <div className="card" style={{ marginBottom: 18 }}>
          <div className="ch"><h3>今日作战节奏</h3><span className="badge violet">AI 帮你排优先级</span></div>
          <Generator
            type="research"
            context={`以下是我的待办清单，请帮我排出今日优先顺序与执行节奏：\n${ctx || "（无待办）"}`}
            label="✨ 生成今日作战节奏"
          />
        </div>

        <div className="grid cols-2">
          <div className="card">
            <div className="ch"><h3>待办 ({todo.length})</h3></div>
            {todo.length === 0 ? (
              <div className="empty">全部搞定 🎉</div>
            ) : (
              <table className="table">
                <thead><tr><th>待办</th><th>紧急度</th><th>来源</th><th>截止</th></tr></thead>
                <tbody>
                  {todo.map((t, i) => (
                    <tr key={i}>
                      <td className="strong">{String(t.title)}</td>
                      <td>{urgencyTag(t.urgency)}</td>
                      <td>{sourceTag(t.source)}</td>
                      <td>{String(t.deadline)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="card">
            <div className="ch"><h3>已完成 ({done.length})</h3></div>
            {done.length === 0 ? (
              <div className="empty">暂无</div>
            ) : (
              <table className="table">
                <thead><tr><th>事项</th><th>紧急度</th><th>来源</th></tr></thead>
                <tbody>
                  {done.map((t, i) => (
                    <tr key={i}>
                      <td className="strong" style={{ textDecoration: "line-through", color: "var(--text-3)" }}>{String(t.title)}</td>
                      <td>{urgencyTag(t.urgency)}</td>
                      <td>{sourceTag(t.source)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
