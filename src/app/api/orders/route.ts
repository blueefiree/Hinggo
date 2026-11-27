import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const buyerId = searchParams.get("buyerId");

  let query = supabaseAdmin.from("orders").select("*").order("created_at", { ascending: false });

  if (buyerId) {
    query = query.eq("buyer_id", buyerId);
  }

  const { data: orders } = await query;
  return NextResponse.json({ orders: orders || [] });
}
