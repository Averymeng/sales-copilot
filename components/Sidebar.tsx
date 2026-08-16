"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { group: string; items: { href: string; label: string; ico: string }[] }[] = [
  {
    group: "工作台",
    items: [
      { href: "/", label: "首页", ico: "◧" },
      { href: "/leads", label: "新客开拓", ico: "✦" },
      { href: "/industry", label: "行业大盘", ico: "🌐" },
    ],
  },
  {
    group: "客户",
    items: [
      { href: "/accounts", label: "我的客户", ico: "◉" },
      { href: "/campaigns", label: "客户投放", ico: "◫" },
      { href: "/proposals", label: "提案与复盘", ico: "▤" },
    ],
  },
  {
    group: "个人",
    items: [
      { href: "/tasks", label: "待办 / 日程", ico: "☑" },
      { href: "/knowledge", label: "知识库", ico: "❖" },
      { href: "/qa", label: "精灵问答", ico: "💬" },
    ],
  },
];

const BRAND_SVG = (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="13.5" cy="13.5" r="7.5" stroke="#fff" strokeWidth="2.4" />
    <line x1="18.6" y1="18.6" x2="24.5" y2="24.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M23.5 5.5l1.3 2.9 2.9 1.3-2.9 1.3-1.3 2.9-1.3-2.9-2.9-1.3 2.9-1.3z" fill="#fff" />
  </svg>
);

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">{BRAND_SVG}</div>
        <div>
          <div className="name">觅客精灵</div>
          <div className="name" />
          <div className="sub">Sales Copilot</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map((g) => (
          <div key={g.group}>
            <div className="group">{g.group}</div>
            {g.items.map((it) => {
              const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
              return (
                <Link key={it.href} href={it.href} className={`${active ? "active" : ""}`}>
                  <span className="ico">{it.ico}</span>
                  {it.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="side-foot">
        <div className="av">孟</div>
        <div>
          <div className="who">孟承泽</div>
          <div className="role">KA 销售 · 教育行业</div>
        </div>
      </div>
    </aside>
  );
}
