// 修复 Neon 表 SERIAL 序列：种子导入用了显式 id，序列未自增，
// 导致后续 insert 触发主键冲突。本脚本将每个表的序列重置为 MAX(id)+1。
import fs from "fs";
import path from "path";
import postgres from "postgres";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^DATABASE_URL=(.*)$/);
    if (m) process.env.DATABASE_URL = m[1].trim();
  }
}
if (!process.env.DATABASE_URL) {
  console.error("未找到 DATABASE_URL");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false });
const tables = [
  "users", "accounts", "leads", "contacts", "proposals", "campaigns",
  "campaign_metrics_daily", "creatives", "followups", "tasks", "events",
  "reports", "knowledge_base", "knowledge_personal", "industry_benchmark",
  "chat_messages", "agent_runs",
];

for (const t of tables) {
  try {
    await sql.unsafe(
      `SELECT setval(pg_get_serial_sequence('"${t}"','id'), GREATEST((SELECT MAX(id) FROM "${t}"), 1), true)`,
    );
    console.log(`✓ ${t} 序列已重置`);
  } catch (e) {
    console.warn(`跳过 ${t}:`, e.message);
  }
}
await sql.end();
console.log("完成");
