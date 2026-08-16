# 觅客精灵 · 长期记忆 (MEMORY.md)

> 跨会话保留的项目约定与用户习惯。每日流水见 `2026-08-16.md`。

## 用户背景
- 孟承泽（Averymeng），AI 初学者，正在做第一个 vibecoding 项目（简历/求职用）。
- 术语可正常讲，但外部概念附网页链接帮助自学。
- 用户习惯：改动前先慢、先对齐；害怕 AI 越改越差，养成"先存一版到 GitHub 再继续"的习惯。

## 项目
- 产品「觅客精灵」：小红书 KA 广告销售工作台，成人教育行业，私信转化链路。
- 技术栈：Next.js + Vercel + Neon(Postgres) + DeepSeek(LLM) + Tavily(联网搜索)。
- 密钥在 `.env.local`（Tavily + DeepSeek），**绝不入库**（已 .gitignore）。

## 长期约定（重要）
- **"git / 提交 / 存一版" = 提交并推送到远程** `https://github.com/Averymeng/sales-copilot.git`（远程名 origin，分支 main）。
- 用户每次说存一版，执行 `git add -A && git commit && git push -u origin main`。
- 用户偏好：频繁备份当前好版本，再继续迭代，避免丢失可用状态。

## 产品关键决策（已锁定，详见日期记忆）
- 指标：北极星=消耗；过程=封面点击/按钮点击/留资率；结果=留资成本(CPL)；版位=信息流+搜索。
- 行业=成人教育；赛道=考公考编/语言留学/职业教育/兴趣教育/学历提升(K12 排除)。
- 3 个 Agent：sales_copilot(编排)、商机发现(ReAct)、竞品/行业监测(ReAct)；其余为 Skill/Workflow。
- IA：以"客户"为中心。页面=首页/新客开拓/我的客户/客户档案/客户投放/提案与复盘/待办/知识库。
- 贯穿交互：查看类按钮统一为**页面内浮层 Drawer**，不跳转。
- 设计风格：低饱和高级感(Premium SaaS)，主色低饱和靛蓝，非电光；平台 SVG logo(放大镜+火花)。
