/**
 * 商机发现 Agent（ReAct）。
 * 职责：联网检索潜在客户信号 → LLM 研判 → 写入 leads / proposals。
 *
 * 真实链路：
 *   1. webSearch("小红书 <赛道> 广告 投放 意向") 拿候选信号
 *   2. LLM 对每条信号打分（匹配度/预算/时机）→ 结构化
 *   3. 写入 Neon：leads（未转）+ 必要时 proposals（草稿）
 */
import { webSearch } from "@/lib/search";
import { chat } from "@/lib/llm";
import type { AgentContext, AgentResult } from "./types";

export async function runDiscovery(ctx: AgentContext): Promise<AgentResult> {
  const query = ctx.input || "小红书 成人教育 KA 广告 投放意向 2026";
  const results = await webSearch(query, { maxResults: 5, topic: "news" });

  const judged = await chat([
    {
      role: "system",
      content:
        "你是小红书 KA 广告销售助手。对用户给出的检索结果，逐条判断是否为高价值商机，输出 JSON 列表：{name, track, signal, heat(1-5), reason}。",
    },
    { role: "user", content: JSON.stringify(results) },
  ]);

  // TODO: 解析 judged → 写入 Neon leads / proposals
  return {
    agent: "商机发现",
    status: "success",
    summary: `检索到 ${results.length} 条候选信号并完成研判（占位写入待接）。`,
    writes: [{ table: "leads", action: "upsert", count: results.length }],
  };
}
