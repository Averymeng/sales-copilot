# 觅客精灵 · 数据库（Neon Postgres）

版本 v1.0 · 2026-08-16 · 17 张表

## 说明
- 业务数据为模拟；客户身份可由联网搜索补全，客单价/对接人为模型推测。
- Schema：`schema.sql`（完整 DDL，含索引）。
- 种子数据：`seed/*.csv`（与演示页 demo 数据一致，15 客户/每赛道3个）。

## 表清单

| 表 | 说明 | 关键字段 |
|---|---|---|
| users | 销售用户 | name/role/team |
| accounts | 客户（核心） | name/track/stage/spend/budget/health/contact_id |
| leads | 线索池 | name/track/signal/research_report/status/account_id |
| contacts | 关键人 | name/title/decision_power/comm_style/preference |
| proposals | 提案与复盘 | account_id/type/theme/content/budget/version/status |
| campaigns | 投放活动 | account_id/objective/start_date/status |
| campaign_metrics_daily | 每日投放指标 | campaign_id/account_id/date/placement/spend/ctr/lead_cost |
| creatives | 广告素材 | account_id/title/copy/cover_style/ctr/leads/reuse_count |
| followups | 跟进记录 | account_id/date/type/summary/next_action |
| tasks | 待办 | title/urgency/deadline/status/source |
| events | 日程 | title/date/type/related_account |
| reports | 报告 | account_id/type/content/generated_by |
| knowledge_personal | 个人知识 | title/content/tag |
| knowledge_base | 平台知识（RAG 源） | title/content/source/tag |
| industry_benchmark | 行业大盘 | track/consumption/lead_cost/wow/heat |
| chat_messages | 对话记录 | session_id/role/content |
| agent_runs | agent 运行日志 | agent/trigger/input/output/status |

## 导入
```bash
# 创建库
psql "$NEON_URL" -f schema.sql
# 导入种子（示例）
psql "$NEON_URL" -c "\copy accounts FROM 'seed/accounts.csv' WITH CSV HEADER"
# ... 其余表同理
```
