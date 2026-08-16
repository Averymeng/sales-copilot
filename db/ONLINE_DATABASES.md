# 觅客精灵 · 在线资料库（正式可用，持久化）

> 由「资料库」skill 导入 `db/seed/*.csv` 生成，已上线到 workbuddy.cn 空间。
> 数据可随时在线增删改、多人维护，正式上线后可用（非本地预览）。
> 导入时间：2026-08-16

## 数据表（17 张）

| 表名 | Database ID | 在线链接 |
|---|---|---|
| accounts（客户花名册） | On6f0fYhTft4GSwsfEJIgN | https://www.workbuddy.cn/space/d/On6f0fYhTft4GSwsfEJIgN |
| agent_runs | 0iiR55WiNYnJkBW6mHNl4D | https://www.workbuddy.cn/space/d/0iiR55WiNYnJkBW6mHNl4D |
| campaign_metrics_daily | 9R9iEPi90j5JrTV7UQakQr | https://www.workbuddy.cn/space/d/9R9iEPi90j5JrTV7UQakQr |
| campaigns | 3W3TWrnpYDqRxvaQIv1dI2 | https://www.workbuddy.cn/space/d/3W3TWrnpYDqRxvaQIv1dI2 |
| chat_messages | 1QJbow57DIZZKT0gDL6pgA | https://www.workbuddy.cn/space/d/1QJbow57DIZZKT0gDL6pgA |
| contacts | g2npIIvcP425UNMK6AFtbW | https://www.workbuddy.cn/space/d/g2npIIvcP425UNMK6AFtbW |
| creatives | zkGO0I8OBKExgjq8y3Q4Au | https://www.workbuddy.cn/space/d/zkGO0I8OBKExgjq8y3Q4Au |
| events | tXrkxreWQhQyvEC7jPMPB3 | https://www.workbuddy.cn/space/d/tXrkxreWQhQyvEC7jPMPB3 |
| followups | wICezW3mz8vwJAbf3QZG2f | https://www.workbuddy.cn/space/d/wICezW3mz8vwJAbf3QZG2f |
| industry_benchmark | rmLMzmkkOp3WTEe1VQvw7r | https://www.workbuddy.cn/space/d/rmLMzmkkOp3WTEe1VQvw7r |
| knowledge_base | 4tHCuD4EcZbCWREQRx6cHO | https://www.workbuddy.cn/space/d/4tHCuD4EcZbCWREQRx6cHO |
| knowledge_personal | IOWPAUUjrIFlGuVy2Iixqg | https://www.workbuddy.cn/space/d/IOWPAUUjrIFlGuVy2Iixqg |
| leads | qWTK4Xla9MSWHfLj0sLMLR | https://www.workbuddy.cn/space/d/qWTK4Xla9MSWHfLj0sLMLR |
| proposals | 8YGxxrh8QuPAqPnkkc7jNJ | https://www.workbuddy.cn/space/d/8YGxxrh8QuPAqPnkkc7jNJ |
| reports | CluIA6fa0zSZ7C8Wc8Nn4N | https://www.workbuddy.cn/space/d/CluIA6fa0zSZ7C8Wc8Nn4N |
| tasks | PlKutw8pADwt5pydxyj6hy | https://www.workbuddy.cn/space/d/PlKutw8pADwt5pydxyj6hy |
| users | EjRCsYGWWsIBDwMBnJ3N9F | https://www.workbuddy.cn/space/d/EjRCsYGWWsIBDwMBnJ3N9F |

## 联动网页（CSV ↔ HTML）

- **客户花名册（在线页）**：https://www.workbuddy.cn/space/d/FbwluMkPLEw4neFuidpW79
  - 绑定 accounts 表（ID: On6f0fYhTft4GSwsfEJIgN）
  - 实时读取 + 新增客户（db.query / db.addRecord），已通过 SDK lint
  - 源码：`preview/accounts-data.html`
- **工作台总览（在线页）**：https://www.workbuddy.cn/space/d/I9e07pICJ3BV3N5frgTjJH
  - 聚合读取 7 张核心表（accounts/campaigns/leads/tasks/contacts/creatives/agent_runs）
  - KPI 实时统计 + 客户/在投计划/待办/线索列表（db.query）
  - 源码：`preview/workbench.html`

## 与本地文件的关系

- 本地 `db/schema.sql` + `db/seed/*.csv` 是开发期建表/种子；在线资料库是正式运行态。
- 二者结构一致；线上数据以 UI 内编辑为准。
