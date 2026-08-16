import { getTasks } from "@/lib/db";

export default async function TasksPage() {
  const tasks = await getTasks();
  return (
    <div>
      <div className="card-head"><h1 style={{ margin: 0, fontSize: 22, color: "var(--ink)" }}>待办事项</h1>
        <span className="badge">共 {tasks.length} 项</span></div>
      <div className="card">
        <table className="tbl">
          <thead><tr><th>待办</th><th>详情</th><th>紧急度</th><th>截止</th><th>来源</th><th>状态</th></tr></thead>
          <tbody>
            {tasks.map((t, i) => (
              <tr key={i}>
                <td className="strong">{String(t.title)}</td>
                <td>{String(t.detail)}</td>
                <td>{String(t.urgency).includes("紧急") ? <span className="tag danger">紧急</span> : <span className="tag warn">{String(t.urgency)}</span>}</td>
                <td>{String(t.deadline)}</td>
                <td>{String(t.source)}</td>
                <td>{String(t.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
