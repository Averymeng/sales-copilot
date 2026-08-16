-- 觅客精灵 · 数据库 Schema (Neon Postgres)
-- 版本 v1.0 · 2026-08-16 · 17 张表
-- 说明：业务数据为模拟；客户身份可由联网搜索补全，客单价/对接人为模型推测。

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(50)  NOT NULL,
  role          VARCHAR(50),
  team          VARCHAR(50),
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS accounts (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  track         VARCHAR(50)  NOT NULL,          -- 赛道：考公考编/职业教育/语言留学/学历提升
  product       VARCHAR(100),                    -- 主营品
  city          VARCHAR(50),
  stage         VARCHAR(20)  NOT NULL DEFAULT '预合作',  -- 预合作 / 已有
  spend         NUMERIC(14,2) DEFAULT 0,         -- 累计消耗
  budget        NUMERIC(14,2) DEFAULT 0,         -- 年框预算
  health        VARCHAR(20)  DEFAULT 'normal',  -- normal / warning / danger
  contact_id    INTEGER REFERENCES contacts(id),
  created_at    TIMESTAMPTZ  DEFAULT now(),
  updated_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  track         VARCHAR(50),
  product       VARCHAR(100),
  budget_est    NUMERIC(14,2),
  signal        TEXT,                            -- 信号正文（不带🔥触发前缀）
  source_url    TEXT,
  heat          INTEGER DEFAULT 1,               -- 赛道热度 1-3
  research_report TEXT,                          -- 商机发现 Agent 生成的中等篇幅调研报告
  status        VARCHAR(20) DEFAULT '未转',       -- 未转 / 已转
  account_id    INTEGER REFERENCES accounts(id),
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  name          VARCHAR(50)  NOT NULL,
  title         VARCHAR(50),                     -- 职位
  decision_power VARCHAR(20),                    -- 决策影响力：高/中/低
  comm_style    VARCHAR(50),                     -- 沟通风格
  preference     TEXT,                            -- 偏好
  phone         VARCHAR(30),
  wechat        VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS proposals (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  type          VARCHAR(20) NOT NULL,            -- 提案 / 复盘
  title         VARCHAR(200),
  theme         VARCHAR(200),                    -- 一句话方案主题/切入角度
  content       TEXT,                            -- 7 块提案 + 报价
  budget        NUMERIC(14,2),
  version       INTEGER DEFAULT 1,
  status        VARCHAR(20) DEFAULT '草稿',       -- 草稿 / 已采纳
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS campaigns (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  name          VARCHAR(200),
  objective     VARCHAR(100),
  start_date    DATE,
  status        VARCHAR(20) DEFAULT '投放中'       -- 投放中 / 暂停 / 已结束
);

CREATE TABLE IF NOT EXISTS campaign_metrics_daily (
  id            SERIAL PRIMARY KEY,
  campaign_id   INTEGER REFERENCES campaigns(id),
  account_id    INTEGER REFERENCES accounts(id),
  date          DATE          NOT NULL,
  placement     VARCHAR(20)   NOT NULL,          -- 信息流 / 搜索
  spend         NUMERIC(12,2),
  impressions   INTEGER,
  clicks        INTEGER,
  ctr           NUMERIC(6,4),                     -- 点击率
  button_rate   NUMERIC(6,4),                     -- 按钮率
  lead_count    INTEGER,                          -- 留资数
  lead_cost     NUMERIC(8,2)                      -- 留资成本
);

CREATE TABLE IF NOT EXISTS creatives (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  campaign_id   INTEGER REFERENCES campaigns(id),
  title         VARCHAR(200),
  copy          TEXT,                             -- 文案
  cover_style   VARCHAR(50),                      -- v1 样式卡类型
  cover_url     TEXT,                             -- v1 模拟/CSS 生成，接 Canva 后为真实图
  placement     VARCHAR(20),
  ctr           NUMERIC(6,4),
  leads         INTEGER,
  reuse_count   INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS followups (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  date          DATE,
  type          VARCHAR(20),                      -- 电话 / 微信 / 拜访
  summary       TEXT,
  next_action   TEXT,
  owner         VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200) NOT NULL,
  detail        TEXT,
  urgency       VARCHAR(20) DEFAULT '普通',        -- 紧急 / 节点 / 优化 / 普通
  deadline      DATE,
  status        VARCHAR(20) DEFAULT '待办',         -- 待办 / 完成
  source        VARCHAR(20) DEFAULT '人工',         -- 人工 / AI生成
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200),
  date          DATE,
  type          VARCHAR(50),
  related_account VARCHAR(100),
  note          TEXT
);

CREATE TABLE IF NOT EXISTS reports (
  id            SERIAL PRIMARY KEY,
  account_id    INTEGER REFERENCES accounts(id),
  type          VARCHAR(20),                      -- 周复盘 / 月报
  content       TEXT,
  generated_by  VARCHAR(50),                      -- agent / skill 名
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_personal (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200),
  content       TEXT,
  tag           VARCHAR(50),
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS knowledge_base (
  id            SERIAL PRIMARY KEY,
  title         VARCHAR(200),
  content       TEXT,
  source        VARCHAR(100),                     -- 平台规则 / RAG 来源
  tag           VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS industry_benchmark (
  id            SERIAL PRIMARY KEY,
  track         VARCHAR(50) NOT NULL,
  consumption   NUMERIC(14,2),                    -- 赛道昨日大盘消耗
  lead_cost     NUMERIC(8,2),                     -- 大盘留资成本
  wow           NUMERIC(6,4),                     -- 环比
  heat          INTEGER                           -- 热度
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id            SERIAL PRIMARY KEY,
  session_id    VARCHAR(50),
  role          VARCHAR(20),                      -- 用户 / AI
  content       TEXT,
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id            SERIAL PRIMARY KEY,
  agent         VARCHAR(50),                      -- sales_copilot / 商机发现 / 竞品监测 / 值守
  trigger       VARCHAR(20),                      -- 定时 / 事件 / 查询
  input         TEXT,
  output        TEXT,
  status        VARCHAR(20) DEFAULT '成功',        -- 成功 / 失败
  created_at    TIMESTAMPTZ  DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_accounts_track ON accounts(track);
CREATE INDEX IF NOT EXISTS idx_campaign_metrics_date ON campaign_metrics_daily(date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
