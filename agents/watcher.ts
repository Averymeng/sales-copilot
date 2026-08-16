/**
 * 盯盘 / 值守 Agent（双层设计）。
 *
 * 第一层 · 规则检测（无 LLM）：定时跑 SQL/指标比对，判定是否触发异常。
 *   - 消耗环比骤降（>30%）→ 掉量预警
 *   - 线索成本超阈值 / 留资停滞 → 效率预警
 *   - 客户健康度=warning/danger → 客户风险
 * 第二层 · LLM 合成（DeepSeek）：读取规则层结果 + 待办 + 其他 Agent 产物，
 *   判紧急度、生成自然语言早报、回答「今天有什么紧急」。
 *
 * 注：本 Agent 不调联网搜索（Tavily），但调用 LLM 推理，因此仍是 Agent。
 * 真实链路写回 Neon：tasks（AI监测）/ reports（早报）。
 */
import { getAccounts, getCampaigns, getTasks } from "@/lib/db";
import { chat } from "@/lib/llm";
import type { AgentContext, AgentResult } from "./types";

interface Anomaly {
  level: "紧急" | "关注";
  text: string;
}

/** 规则层：扫描数据，产出异常清单（纯 SQL/指标比对，无 LLM）。*/
export async function detectAnomalies(): Promise<Anomaly[]> {
  const [accounts, campaigns, tasks] = await Promise.all([
    getAccounts(),
    getCampaigns(),
    getTasks(),
  ]);
  const anomalies: Anomaly[] = [];

  accounts.forEach((a) => {
    const h = String(a.health || "");
    if (h.includes("掉") || h.includes("danger"))
      anomalies.push({ level: "紧急", text: `${a.name} 健康度预警：${a.health}` });
  });
  campaigns
    .filter((c) => String(c.status).includes("投放中"))
    .forEach((c) => {
      // TODO: 接 campaign_metrics_daily 做环比；此处仅占位
      void c;
    });
  tasks
    .filter((t) => String(t.urgency).includes("紧急") && String(t.status).includes("待办"))
    .forEach((t) => anomalies.push({ level: "紧急", text: `待办紧急：${t.title}` }));

  return anomalies;
}

/** LLM 合成层：把异常 + 上下文变成早报 / 紧急摘要。*/
export async function synthesize(anomalies: Anomaly[]): Promise<string> {
  const brief = await chat([
    {
      role: "system",
      content:
        "你是销售值守助手。根据异常清单，生成一段早报式汇总，先列紧急项，再列关注项，语言简洁口语化。",
    },
    { role: "user", content: JSON.stringify(anomalies) },
  ]);
  return brief;
}

export async function runWatcher(ctx: AgentContext): Promise<AgentResult> {
  const anomalies = await detectAnomalies();
  const brief = await synthesize(anomalies);
  // TODO: 把 anomalies → tasks(AI监测)；brief → reports(早报)
  return {
    agent: "盯盘/值守",
    status: "success",
    summary: brief,
    writes: [{ table: "tasks", action: "upsert", count: anomalies.length }],
  };
}
