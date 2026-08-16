# 接入 Neon 运行数据库（傻瓜文档）

当前项目默认读 `db/seed/*.csv`（本地示例数据），这样"今天就能跑"。
要变成**真实运行库**（Agent 能存数据、刷新后还在），只需把数据放到云端 Neon Postgres，应用会自动从 CSV 回退切到 Neon，**代码一行都不用改**。

---

## 第 1 步：注册 / 登录 Neon

1. 打开 https://neon.tech ，用 GitHub 账号登录（推荐，免注册）。
2. 进入控制台后点 **"New Project"**（新建项目）。
3. 项目名随便填，例如 `mikei-spirit`；**Postgres 版本选默认即可**。
4. 点 **Create**。

## 第 2 步：拿到数据库连接串

1. 项目创建后，控制台会直接显示 **Connection String（连接串）**，类似：
   ```
   postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
2. 复制整串（包含 `postgresql://...` 那一行）。
   > 找不到？点左侧 **Dashboard → Connection Details → Pooled connection**，复制 "Connection string"。

## 第 3 步：填到项目里

1. 在项目根目录找到 `.env.example`，复制成 `.env.local`：
   ```bash
   cp .env.example .env.local
   ```
2. 用任意编辑器打开 `.env.local`，把复制的连接串填进去：
   ```
   DATABASE_URL=postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   （其余的 `DEEPSEEK_API_KEY` / `TAVILY_API_KEY` 如已有可留着。）

## 第 4 步：建表 + 灌入种子数据

在项目根目录运行：
```bash
npm run db:seed
```
这条命令会：
- 按 `db/schema.sql` 在 Neon 上建好 17 张表；
- 把 `db/seed/*.csv` 的示例数据灌进去。
看到 "seeded 17 tables" 之类提示即成功。

## 第 5 步：启动，验证已切到真库

```bash
npm run dev
```
打开 http://localhost:3000 ，看首页右上角徽标：
- 显示 **"数据来源：Neon Postgres"** → 已成功接真库 ✅
- 显示 **"数据来源：本地样本 CSV"** → 没接上，检查 `.env.local` 的 `DATABASE_URL` 是否正确。

---

## 常见问题

**Q：切换后原来的 CSV 还在吗？**
在的，`db/seed/*.csv` 是离线备份，随时可用；切到 Neon 只是"运行时读哪个"。

**Q：线上资料库（workbuddy.cn）和 Neon 是同一个吗？**
不是。资料库是"在线可编辑的演示镜像"，Neon 才是 Agent 服务端真正读写的运行库。两者数据独立；需要时我可以把资料库的数据也同步进 Neon。

**Q：改了数据库字段怎么办？**
改 `db/schema.sql` 和对应 `db/seed/*.csv`，然后重跑 `npm run db:seed`（已带幂等清空）。

**Q：部署到 Vercel 时要做什么？**
在 Vercel 项目的 Environment Variables 里加同一条 `DATABASE_URL`，部署即可连真库。
