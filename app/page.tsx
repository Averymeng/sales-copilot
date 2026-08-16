import { getOverview, getIndustryBenchmark } from "@/lib/db";
export const dynamic = "force-dynamic";

const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function healthClass(v: unknown): string {
  const s = String(v || "");
  if (s.includes("掉") || s.includes("danger")) return "danger";
  if (s.includes("预警") || s.includes("未") || s.includes("warn")) return "warn";
  return "ok";
}

export default async function HomePage() {
  const { kpis, accounts, activeCampaigns, todoTasks, leads } = await getOverview();
  const bench = await getIndustryBenchmark();

  // —— 早报数据 ——
  const totalSpendWan = accounts.reduce((s, a) => s + Number(a.spend || 0), 0);
  const avgLeadCost =
    bench.length > 0
      ? Math.round(bench.reduce((s, b) => s + Number(b.lead_cost || 0), 0) / bench.length)
      : 88;
  const ringPct = Math.min(96, 55 + kpis.activeCampaigns * 2);

  // —— 赛道占比（compo）——
  const trackMap: Record<string, number> = {};
  for (const a of accounts) {
    const t = String(a.track || "其他");
    trackMap[t] = (trackMap[t] || 0) + 1;
  }
  const trackEntries = Object.entries(trackMap);
  const trackTotal = trackEntries.reduce((s, [, n]) => s + n, 0) || 1;
  const trackColors = ["var(--accent)", "var(--violet)", "var(--terra)", "var(--lav)", "var(--deep)"];

  // —— 今日 3 件事 ——
  const top3 = [...todoTasks]
    .sort((a, b) => {
      const rank = (x: unknown) => (String(x).includes("紧急") ? 0 : String(x).includes("高") ? 1 : 2);
      return rank(a.urgency) - rank(b.urgency);
    })
    .slice(0, 3);

  // —— 关键变化 & 异常 ——
  const warnAccounts = accounts.filter((a) => {
    const h = healthClass(a.health);
    return h === "warn" || h === "danger";
  });

  // —— 行业大盘 ——
  const benchSorted = [...bench].sort((a, b) => Number(b.consumption) - Number(a.consumption));

  // —— 实时热点（沿用设计规范示例，贴合教育行业）——
  const hot = [
    { cat: "政策", c: "blue", t: "成人高考 8 月报名季开启，咨询量周环比 +41%", d: "→ 考公考编 / 学历提升赛道进入投放窗口" },
    { cat: "政策", c: "blue", t: "教育部预告 2027 考研大纲调整，公共课权重上浮", d: "→ 考研机构内容需提前对齐新大纲选题" },
    { cat: "竞品", c: "terra", t: "竞品「高顿」小红书搜索词新增「AI 会计证」", d: "→ 建议职业教育客户跟进该词" },
    { cat: "竞品", c: "terra", t: "「中公」上线「0 元体验营」引流，落地页改版", d: "→ 留资链路变化，可参考其钩子设计" },
    { cat: "热点", c: "violet", t: "#考研倒计时 话题阅读破 3.2 亿", d: "→ 考研冲刺课种草窗口开启" },
    { cat: "热点", c: "violet", t: "雅思换题季临近，留学搜索量走高", d: "→ 新航道 / 新东方前途可加投搜索版位" },
    { cat: "平台", c: "ok", t: "小红书内测「教育行业搜索品专」", d: "→ 高预算客户可优先申请，抢占搜索首位" },
  ];

  const now = new Date();
  const dateLabel = `${now.getMonth() + 1} 月 ${now.getDate()} 日 ${WEEK[now.getDay()]}`;

  return (
    <div>
      <header className="topbar">
        <div>
          <h1>早上好，承泽 👋</h1>
        </div>
        <div className="search">🔍<input placeholder="Ask anything" /></div>
      </header>

      <div className="content">
        {/* Row 1: 早报 + 我的业绩 */}
        <div className="grid cols-3" style={{ gridTemplateColumns: "1.6fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="card" style={{ background: "linear-gradient(120deg,#fff,#F3EEFE)", borderColor: "#E0DAFD" }}>
            <div className="ch">
              <h3>今日早报 · {dateLabel}</h3>
              <span className="badge blue">AI 已生成</span>
            </div>
            <p className="note" style={{ margin: "2px 0 16px" }}>
              早安，承泽。昨日大盘整体向好，{warnAccounts.length > 0 ? `${warnAccounts.length} 个账户出现异常需关注` : "各账户运行平稳"}；
              考研赛道进入种草窗口，可推进预合作客户拜访。
            </p>
            <div className="brief-row">
              <div className="brief">
                <div className="b-head"><span className="b-lbl">客户总消耗</span></div>
                <div className="b-val">¥{totalSpendWan.toFixed(1)}<span className="u">万</span></div>
                <div className="b-delta up">▲ 6.3% 较上周</div>
              </div>
              <div className="brief">
                <div className="b-head"><span className="b-lbl">线索总数</span></div>
                <div className="b-val">{kpis.leads}</div>
                <div className="b-delta up">▲ 9.1% 较上周</div>
              </div>
              <div className="brief">
                <div className="b-head"><span className="b-lbl">平均留资成本</span></div>
                <div className="b-val">¥{avgLeadCost}</div>
                <div className="b-delta down">▲ 偏高</div>
                <div className="b-note">高于赛道均值，主因信息流版位按钮点击率下滑。</div>
              </div>
            </div>
          </div>

          <div className="card perf">
            <div className="ch">
              <h3>我的业绩</h3>
              <span className="seg-meta">本月 · <b style={{ color: "var(--ok)" }}>▲ 11.2%</b></span>
            </div>
            <div className="perf-top">
              <div className="ring">
                <svg viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#5B5BD8" />
                      <stop offset="1" stopColor="#8E85C7" />
                    </linearGradient>
                  </defs>
                  <circle className="bg" cx="18" cy="18" r="15.9" />
                  <circle
                    className="arc"
                    cx="18"
                    cy="18"
                    r="15.9"
                    stroke="url(#ringGrad)"
                    strokeDasharray={`${ringPct} ${100 - ringPct}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <div className="center">
                  <div className="pct">{ringPct}%</div>
                  <div className="lbl">目标完成率</div>
                </div>
              </div>
              <div className="perf-stats">
                <div className="ps"><div className="lbl">本月消耗</div><div className="val">¥{totalSpendWan.toFixed(0)}万</div></div>
                <div className="ps"><div className="lbl">在投账户</div><div className="val">{kpis.activeCampaigns}</div></div>
                <div className="ps"><div className="lbl">管理客户</div><div className="val">{accounts.length}</div></div>
                <div className="ps"><div className="lbl">平均留资成本</div><div className="val">¥{avgLeadCost}</div></div>
              </div>
            </div>
            <div className="compo">
              <div className="compo-bar">
                {trackEntries.map(([, n], i) => (
                  <i key={i} style={{ width: `${(n / trackTotal) * 100}%`, background: trackColors[i % trackColors.length] }} />
                ))}
              </div>
              <div className="legend">
                {trackEntries.map(([t, n], i) => (
                  <span key={t} style={{ color: trackColors[i % trackColors.length] }}>
                    {t} {Math.round((n / trackTotal) * 100)}%
                  </span>
                ))}
              </div>
            </div>
            <div className="perf-foot">
              <span className="note">本月新增线索</span>
              <b>{leads.length}</b>
              <span className="note">较上月 +2</span>
            </div>
          </div>
        </div>

        {/* Row 2: 今日3件事 + 关键变化 */}
        <div className="grid cols-3" style={{ gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div className="card">
            <div className="ch"><h3>🎯 今日 3 件事</h3></div>
            {top3.length === 0 && <div className="empty">暂无待办</div>}
            {top3.map((t, i) => (
              <div className="li" key={i}>
                <div className="ic terra">!</div>
                <div className="tx">
                  <div className="t">{String(t.title)}</div>
                  <div className="d">紧急度：{String(t.urgency)} · 截止 {String(t.deadline)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="ch">
              <h3>⚠ 关键变化 & 异常事项</h3>
              {warnAccounts.length > 0 && <span className="badge danger">{warnAccounts.length} 项异常</span>}
            </div>
            {warnAccounts.map((a, i) => (
              <div className="li" key={i}>
                <div className="ic terra">!</div>
                <div className="tx">
                  <div className="t">{String(a.name)} · {String(a.health)}</div>
                  <div className="d">赛道 {String(a.track)} · 阶段 {String(a.stage)}，建议本周内排查。</div>
                </div>
              </div>
            ))}
            <div className="li">
              <div className="ic violet">✦</div>
              <div className="tx">
                <div className="t">#考研倒计时 话题阅读破 3.2 亿</div>
                <div className="d">研途 / 新航道等预合作客户进入决策窗口，建议本周内推进拜访。</div>
              </div>
            </div>
            <div className="li">
              <div className="ic">↻</div>
              <div className="tx">
                <div className="t">成人高考报名季开启，咨询量 +41%</div>
                <div className="d">学历提升 / 考公赛道起量，可优先扩量。</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 3: 行业大盘 + 实时热点 */}
        <div className="grid cols-3" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div className="card">
            <div className="ch"><h3>🌐 行业大盘（教育 · 昨日）</h3></div>
            <table className="table" style={{ fontSize: 13 }}>
              <thead>
                <tr><th>赛道</th><th>消耗</th><th>大盘留资成本</th><th>环比</th><th>热度</th></tr>
              </thead>
              <tbody>
                {benchSorted.map((b, i) => {
                  const wow = Number(b.wow || 0);
                  return (
                    <tr key={i}>
                      <td className="strong">{String(b.track)}</td>
                      <td>¥{Math.round(Number(b.consumption) / 10000)}万</td>
                      <td>¥{String(b.lead_cost)}</td>
                      <td className={`delta ${wow >= 0 ? "up" : "down"}`}>{wow >= 0 ? "▲" : "▼"}{Math.abs(wow * 100).toFixed(0)}%</td>
                      <td>{"🔥".repeat(Number(b.heat) || 1)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="card">
            <div className="ch"><h3>⚡ 实时热点 / 行业动态</h3><span className="badge violet">实时</span></div>
            {hot.map((h, i) => (
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
