/**
 * 种子脚本：把 db/seed/*.csv 灌入 Neon Postgres。
 * 用法：在 .env 配置 DATABASE_URL 后运行 `npm run db:seed`。
 * 要求：已先执行 db/schema.sql 建表（表结构与 CSV 表头一致）。
 */
import fs from "fs";
import path from "path";
import { parseCsv } from "../lib/csv";

const SEED_DIR = path.join(process.cwd(), "db", "seed");

const TABLES = [
  "accounts","agent_runs","campaign_metrics_daily","campaigns","chat_messages",
  "contacts","creatives","events","followups","industry_benchmark","knowledge_base",
  "knowledge_personal","leads","proposals","reports","tasks","users",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("缺少 DATABASE_URL，请先在 .env 配置 Neon 连接串。");
    process.exit(1);
  }
  const postgres = (await import("postgres")).default;
  const sql = postgres(process.env.DATABASE_URL);

  for (const table of TABLES) {
    const file = path.join(SEED_DIR, `${table}.csv`);
    if (!fs.existsSync(file)) {
      console.log(`跳过 ${table}（无 csv）`);
      continue;
    }
    const rows = parseCsv(fs.readFileSync(file, "utf8"));
    if (!rows.length) continue;
    const cols = Object.keys(rows[0]);
    // 清空后插入，保证幂等
    await sql`truncate ${sql(table)} restart identity cascade`.catch(() => {});
    for (const r of rows) {
      const keys = cols.filter((c) => r[c] !== "" && r[c] !== undefined) as string[];
      const vals = keys.map((c) => r[c]) as unknown[];
      await sql`insert into ${sql(table)} (${sql(keys as any)}) values (${vals as any})`;
    }
    console.log(`✓ ${table}: ${rows.length} 行`);
  }
  await sql.end();
  console.log("种子导入完成。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
