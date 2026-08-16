import { NextResponse } from "next/server";
import { route } from "@/agents/orchestrator";

export async function POST(req: Request) {
  const { input } = await req.json();
  const result = await route(input || "");
  return NextResponse.json(result);
}
