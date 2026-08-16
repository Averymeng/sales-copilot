/**
 * 联网搜索客户端（Tavily）。
 * 供「商机发现」「竞品/行业监测」两个 ReAct Agent 调用。
 */

export interface SearchResult {
  title: string;
  url: string;
  content: string;
}

export async function webSearch(
  query: string,
  opts: { maxResults?: number; topic?: string } = {},
): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    console.warn("[search] 未配置 TAVILY_API_KEY，返回占位结果");
    return [
      {
        title: `[占位] ${query}`,
        url: "https://example.com",
        content: "请在 .env 配置 TAVILY_API_KEY 后获得真实联网检索结果。",
      },
    ];
  }

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      max_results: opts.maxResults ?? 5,
      topic: opts.topic ?? "general",
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily 调用失败: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return (data.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}
