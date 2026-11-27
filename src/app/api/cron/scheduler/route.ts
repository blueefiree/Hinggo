import { NextResponse } from "next/server";
import { runScheduler } from "@/lib/scheduler";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const advance = parseInt(searchParams.get("advanceHours") || "0", 10);
  const result = await runScheduler(advance);
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const advance = typeof body.advanceHours === "number" ? body.advanceHours : 0;
    const result = await runScheduler(advance);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
