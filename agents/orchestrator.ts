/**
 * 总控编排 Agent（sales_copilot）。
 * 职责：理解销售的自然语言问题，路由到对应 Agent 或直接基于「DB 上下文 + LLM」作答。
 *   - "今天有什么紧急"        → watcher（值守）
 *   - "帮我找新客户 / 商机"    → discovery
 *   - "最近行业有什么变化"     → monitor
 *   - 其余（客户/投放/待办查询）→ 直查 DB + LLM 总结
 */
import { chat } from "@/lib/llm";
import { getOverview } from "@/lib/db";
import { runDiscovery } from "./discovery";
import { runMonitor } from "./monitor";
import { runWatcher } from "./watcher";
import type { AgentContext, AgentResult } from "./types";

export async function route(input: string, ctx: AgentContext = { trigger: "user", input }): Promise<AgentResult> {
  const q = (input || "").toLowerCase();

  if (q.includes("紧急") || q.includes("盯盘") || q.includes("早报"))
    return runWatcher(ctx);
  if (q.includes("商机") || q.includes("新客户") || q.includes("线索"))
    return runDiscovery(ctx);
  if (q.includes("行业") || q.includes("竞品") || q.includes("大盘"))
    return runMonitor(ctx);

  // 默认：用 DB 上下文 + LLM 直接作答
  const overview = await getOverview();
  const answer = await chat([
    {
      role: "system",
      content:
        "你是觅客精灵，小红书 KA 广告销售工作台。基于下方数据快照回答销售问题，简洁、可操作。",
    },
    {
      role: "user",
      content: `问题：${input}\n数据快照：${JSON.stringify(overview.kpis)}`,
    },
  ]);

  return {
    agent: "总控编排",
    status: "success",
    summary: answer,
  };
}
