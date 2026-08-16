import fs from "fs";
import path from "path";
import { parseCsv } from "./csv";

/**
 * 数据层：
 *  - 配置了 DATABASE_URL（Neon Postgres）→ 连真实库，供 Agent/LLM 服务端读写。
 *  - 未配置 → 回退读取本地 db/seed/*.csv，便于本地直接跑通（仅样本数据）。
 * 切到 Neon 只需在 .env 填 DATABASE_URL 并跑 schema.sql + 种子脚本，代码无需改动。
 */

const SEED_DIR = path.join(process.cwd(), "db", "seed");

export type Account = Record<string, string | number>;
export type Row = Record<string, unknown>;

// ---------- CSV 回退 ----------

function loadSeed(name: string): Row[] {
  const p = path.join(SEED_DIR, `${name}.csv`);
  if (!fs.existsSync(p)) return [];
  return parseCsv(fs.readFileSync(p, "utf8"));
}

// ---------- Postgres（懒加载）----------

let _sql: ((strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>) | null = null;
let _pgReady: Promise<unknown> | null = null;

function pgClient() {
  if (!process.env.DATABASE_URL) return null;
  if (!_pgReady) {
    _pgReady = (async () => {
      const mod = await import("postgres");
      const postgres = (mod as any).default ?? mod;
      _sql = postgres(process.env.DATABASE_URL as string, { prepare: false }) as any;
    })();
  }
  return _pgReady;
}

async function pgQuery(table: string): Promise<Row[]> {
  const ready = pgClient();
  if (!ready || !_sql) return [];
  await ready;
  const rows = (await (_sql as any)`select * from ${pgTable(table)}`) as Row[];
  return rows;
}

// postgres 表名需作为标识符；这里所有表名均来自白名单，安全。
function pgTable(name: string): any {
  const allowed = new Set([
    "accounts","agent_runs","campaign_metrics_daily","campaigns","chat_messages",
    "contacts","creatives","events","followups","industry_benchmark","knowledge_base",
    "knowledge_personal","leads","proposals","reports","tasks","users",
  ]);
  if (!allowed.has(name)) throw new Error(`未知表: ${name}`);
  return name;
}

// ---------- 统一读取入口 ----------

async function read(name: string): Promise<Row[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await pgQuery(name);
      if (rows.length) return rows;
    } catch (e) {
      console.warn(`[db] PG 读取 ${name} 失败，回退 CSV:`, (e as Error).message);
    }
  }
  return loadSeed(name);
}

// ---------- 业务聚合查询 ----------

export async function getAccounts() {
  return read("accounts");
}
export async function getCampaigns() {
  return read("campaigns");
}
export async function getLeads() {
  return read("leads");
}
export async function getTasks() {
  return read("tasks");
}
export async function getContacts() {
  return read("contacts");
}
export async function getCreatives() {
  return read("creatives");
}
export async function getAgentRuns() {
  return read("agent_runs");
}

function s(v: unknown): string {
  return v == null ? "" : String(v);
}
function isActive(v: unknown): boolean {
  return s(v).includes("投放中");
}
function isTodo(v: unknown): boolean {
  return s(v).includes("待办");
}
function isUrgent(v: unknown): boolean {
  return s(v).includes("紧急");
}

export async function getOverview() {
  const [accounts, campaigns, leads, tasks, contacts, creatives, runs] =
    await Promise.all([
      getAccounts(),
      getCampaigns(),
      getLeads(),
      getTasks(),
      getContacts(),
      getCreatives(),
      getAgentRuns(),
    ]);

  const activeCampaigns = campaigns.filter((c) => isActive(c.status));
  const todoTasks = tasks.filter((t) => isTodo(t.status));
  const urgentTasks = todoTasks.filter((t) => isUrgent(t.urgency));

  const kpis = {
    accounts: accounts.length,
    activeCampaigns: activeCampaigns.length,
    leads: leads.length,
    tasks: todoTasks.length,
    urgent: urgentTasks.length,
    contacts: contacts.length,
    creatives: creatives.length,
    runs: runs.length,
    source: process.env.DATABASE_URL ? "neon" : "seed-csv",
  };

  return { kpis, accounts, activeCampaigns, todoTasks, leads, runs };
}
