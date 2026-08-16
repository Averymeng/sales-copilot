import Link from "next/link";

const NAV = [
  { href: "/", label: "首页" },
  { href: "/accounts", label: "客户档案" },
  { href: "/campaigns", label: "客户投放" },
  { href: "/leads", label: "商机线索" },
  { href: "/tasks", label: "待办事项" },
  { href: "/qa", label: "精灵问答" },
  { href: "/knowledge", label: "知识库" },
  { href: "/industry", label: "行业动态" },
  { href: "/proposals", label: "提案" },
  { href: "/reports", label: "报告" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">觅客精灵</div>
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} className="nav-item">
          {n.label}
        </Link>
      ))}
      <div className="nav-sep" />
      <div className="nav-item" style={{ color: "var(--muted)", fontSize: 12 }}>
        运行态：{process.env.DATABASE_URL ? "Neon" : "样本 CSV"}
      </div>
    </aside>
  );
}
