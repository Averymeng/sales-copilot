import { NextResponse } from "next/server";
import { chat } from "@/lib/llm";
import { insertRow } from "@/lib/db";

const PROMPTS: Record<string, (ctx: string) => string> = {
  copy: (ctx) =>
    `你是一名小红书 KA 广告资深文案。基于以下投放背景，写 3 条可直接投放的短视频/图文广告文案，每条含「标题 + 正文 + 引导动作」，风格真实、不说教、带钩子，避免违禁词。\n背景：\n${ctx}`,
  research: (ctx) =>
    `你是一名教育行业广告销售分析师。基于以下线索信息，输出一份中等篇幅（约 350 字）的调研报告，包含：客户画像、投放机会判断、预算量级评估、切入话术建议。\n线索：\n${ctx}`,
  proposal: (ctx) =>
    `你是一名小红书 KA 广告销售方案专家。基于以下客户背景，输出一份 7 块结构提案：目标人群、主打卖点、投放节奏、版位组合、创意方向、预期指标、报价建议。\n客户：\n${ctx}`,
  report: (ctx) =>
    `你是一名广告投放分析师。基于以下账户/计划数据，输出一份周复盘：核心指标表现、问题诊断（掉量/成本/素材）、下周优化动作（3 条，可执行）。\n数据：\n${ctx}`,
};

export async function POST(req: Request) {
  const { type, context, accountId, title } = await req.json();
  const build = PROMPTS[type as string];
  if (!build) return NextResponse.json({ error: "未知生成类型" }, { status: 400 });

  try {
    const text = await chat(
      [
        {
          role: "system",
          content: "你是觅客精灵的 AI 生成模块，输出专业、简洁、可直接使用的内容，使用中文。",
        },
        { role: "user", content: build(String(context || "")) },
      ],
      { temperature: 0.6, maxTokens: 1400 },
    );

    let id: number | undefined;
    if (type === "report" && accountId) {
      id = await insertRow("reports", {
        account_id: Number(accountId),
        type: "周复盘",
        content: text,
        generated_by: "AI生成",
      });
    }
    return NextResponse.json({ text, id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
