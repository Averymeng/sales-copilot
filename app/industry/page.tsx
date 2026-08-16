import { getIndustryBenchmark, getEvents } from "@/lib/db";
export const dynamic = "force-dynamic";

function num(v: unknown, d = 0): number {
  const n = Number(v);
  return isNaN(n) ? d : n;
}

const TRACK_COLORS = ["var(--accent)", "var(--violet)", "var(--terra)", "var(--lav)", "var(--deep)"];

export default async function IndustryPage() {
  const [bench, events] = await Promise.all([getIndustryBenchmark(), getEvents()]);
  const total = bench.reduce((s, b) => s + num(b.consumption), 0) || 1;
  const sorted = [...bench].sort((a, b) => num(b.consumption) - num(a.consumption));

  const insights = [
    { cat: "政策", c: "blue", t: "成人高考 8 月报名季开启，咨询量周环比 +41%", d: "→ 考公考编 / 学历提升赛道进入投放窗口" },
    { cat: "竞品", c: "terra", t: "竞品「高顿」小红书搜索词新增「AI 会计证」", d: "→ 建议职业教育客户跟进该词" },
    { cat: "热点", c: "violet", t: "#考研倒计时 话题阅读破 3.2 亿", d: "→ 考研冲刺课种草窗口开启" },
    { cat: "平台", c: "ok", t: "小红书内测「教育行业搜索品专」", d: "→ 高预算客户可优先申请，抢占搜索首位" },
  ];

  return (
    <div>
      <header className="topbar">
        <div><h1>行业大盘</h1></div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="ch"><h3>各赛道昨日大盘消耗</h3><span className="badge violet">竞品行业监测 Agent</span></div>
          <div className="compo-bar" style={{ height: 14 }}>
            {sorted.map((b, i) => (
              <i key={i} style={{ width: `${(num(b.consumption) / total) * 100}%`, background: TRACK_COLORS[i % TRACK_COLORS.length] }} />
            ))}
          </div>
          <div className="legend" style={{ marginTop: 12 }}>
            {sorted.map((b, i) => (
              <span key={i} style={{ color: TRACK_COLORS[i % TRACK_COLORS.length] }}>
                {String(b.track)} {Math.round((num(b.consumption) / total) * 100)}%
              </span>
            ))}
          </div>
          <table className="table" style={{ fontSize: 13, marginTop: 16 }}>
            <thead><tr><th>赛道</th><th>消耗</th><th>大盘留资成本</th><th>环比</th><th>热度</th></tr></thead>
            <tbody>
              {sorted.map((b, i) => {
                const wow = num(b.wow);
                return (
                  <tr key={i}>
                    <td className="strong">{String(b.track)}</td>
                    <td>¥{Math.round(num(b.consumption) / 10000)}万</td>
                    <td>¥{String(b.lead_cost)}</td>
                    <td className={`delta ${wow >= 0 ? "up" : "down"}`}>{wow >= 0 ? "▲" : "▼"}{Math.abs(wow * 100).toFixed(0)}%</td>
                    <td>{"🔥".repeat(num(b.heat) || 1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid cols-2">
          <div className="card">
            <div className="ch"><h3>关键事件 / 节点</h3><span className="badge">{events.length} 条</span></div>
            {events.length === 0 ? (
              <div className="empty">暂无事件</div>
            ) : (
              <div className="tl">
                {events
                  .slice()
                  .sort((a, b) => String(b.date).localeCompare(String(a.date)))
                  .map((e, i) => (
                    <div className="it" key={i}>
                      <div className="dot violet" />
                      <div className="tx">
                        <div className="t">{String(e.date)} · {String(e.type)}：{String(e.title)}</div>
                        <div className="d">{String(e.related_account)} · {String(e.note)}</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="ch"><h3>⚡ 行业动态洞察</h3><span className="badge violet">实时</span></div>
            {insights.map((h, i) => (
              <div className="news" key={i}>
                <span className={`badge ${h.c}`}>{h.cat}</span>
                <div>
                  <div className="t">{h.t}</div>
                  <div className="d">{h.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
