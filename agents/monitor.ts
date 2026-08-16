/**
 * 竞品 / 行业监测 Agent（ReAct）。
 * 职责：联网监测行业大盘、竞品动态、平台政策 → 写入 industry_benchmark / events / knowledge。
 *
 * 真实链路：
 *   1. webSearch("小红书 商业化 政策 教育行业 投放") + 竞品关键词
 *   2. LLM 抽取「变化事件」与「基准指标」
 *   3. 写入 Neon：events（会议/政策/竞品动作）+ industry_benchmark + knowledge_base
 */
import { webSearch } from "@/lib/search";
import { chat } from "@/lib/llm";
import type { AgentContext, AgentResult } from "./types";

export async function runMonitor(ctx: AgentContext): Promise<AgentResult> {
  const query = ctx.input || "小红书 商业化 教育行业 广告政策 竞品动态";
  const results = await webSearch(query, { maxResults: 5 });

  const digest = await chat([
    {
      role: "system",
      content:
        "你是行业监测助手。把检索结果整理为结构化变化事件 JSON：{type, title, related_account?, note, date}。",
    },
    { role: "user", content: JSON.stringify(results) },
  ]);

  // TODO: 解析 digest → 写入 Neon events / industry_benchmark / knowledge_base
  return {
    agent: "竞品/行业监测",
    status: "success",
    summary: `监测到 ${results.length} 条行业信号并生成摘要（占位写入待接）。`,
    writes: [{ table: "events", action: "upsert", count: results.length }],
  };
}
