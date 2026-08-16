/**
 * LLM 客户端（DeepSeek）。
 * 真实调用走 DeepSeek OpenAI 兼容接口；未配 key 时返回占位，便于本地跑通。
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  opts: { temperature?: number; maxTokens?: number } = {},
): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const base = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
  const model = process.env.DEEPSEEK_MODEL || "deepseek-chat";

  if (!apiKey) {
    console.warn("[llm] 未配置 DEEPSEEK_API_KEY，返回占位响应");
    return "[占位] 请在 .env 配置 DEEPSEEK_API_KEY 后获得真实回复。";
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature ?? 0.3,
      max_tokens: opts.maxTokens ?? 1024,
    }),
  });

  if (!res.ok) {
    throw new Error(`DeepSeek 调用失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
