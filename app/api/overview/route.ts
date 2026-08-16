import { NextResponse } from "next/server";
import { getOverview } from "@/lib/db";

export async function GET() {
  const data = await getOverview();
  return NextResponse.json(data);
}
