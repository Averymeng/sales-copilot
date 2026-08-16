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
  "users","accounts","leads","contacts","campaigns","proposals",
  "creatives","campaign_metrics_daily","followups","reports","tasks",
  "events","knowledge_personal","knowledge_base","industry_benchmark",
  "chat_messages","agent_runs",
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("缺少 DATABASE_URL，请先在 .env 配置 Neon 连接串。");
    process.exit(1);
  }
  const postgres = (await import("postgres")).default;
  const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

  // 1) 建表单独一个已提交事务（Neon 连接池+PgBouncer 事务模式下，建表与插入同事务会触发外键校验异常）
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(schemaSql);
  });
  console.log("✓ 已执行 schema.sql（建表，已提交）");

  // 2) 数据导入单独一个事务
  await sql.begin(async (tx) => {
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
      await tx`truncate ${tx(table)} restart identity cascade`.catch(() => {});
      for (const r of rows) {
        const keys = cols.filter((c) => r[c] !== "" && r[c] !== undefined) as string[];
        const vals = keys.map((c) => r[c]) as unknown[];
        const colsSql = keys.map((k) => `"${k}"`).join(", ");
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
        await tx.unsafe(`insert into "${table}" (${colsSql}) values (${placeholders})`, vals as any);
      }
      console.log(`✓ ${table}: ${rows.length} 行`);
    }
  });
  // 3) 重置各表 SERIAL 序列到 MAX(id)+1（显式插入 id 不会推进序列，否则后续自动插入会主键冲突）
  for (const table of TABLES) {
    await sql.unsafe(
      `SELECT setval(pg_get_serial_sequence('"${table}"','id'), GREATEST((SELECT MAX(id) FROM "${table}"), 1), true)`,
    ).catch(() => {});
  }
  await sql.end();
  console.log("种子导入完成。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
