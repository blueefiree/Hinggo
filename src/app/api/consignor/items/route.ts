import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ items: [] });
  }

  const { data: items } = await supabaseAdmin
    .from("items")
    .select("*")
    .eq("consignor_id", userId)
    .order("created_at", { ascending: false });

  return NextResponse.json({ items: items || [] });
}
