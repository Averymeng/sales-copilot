/**
 * Agent 公共类型。
 * 4 个 Agent 共享：输入上下文、执行结果、以及「写回数据层」的约定。
 */

export interface AgentContext {
  /** 当前用户/销售身份（来自 users 表）*/
  userId?: string;
  /** 触发方式：定时 / 用户提问 / 事件 */
  trigger: "schedule" | "user" | "event";
  /** 用户自然语言输入（orchestrator 路由时带）*/
  input?: string;
}

export interface AgentResult {
  agent: string;
  status: "success" | "partial" | "error";
  summary: string;
  /** 本次产生的写入动作（示意，真实实现会调用 lib/db 写 Neon）*/
  writes?: { table: string; action: string; count: number }[];
  error?: string;
}
