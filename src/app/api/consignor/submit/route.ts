import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const itemId = randomUUID();
    const itemCode = `HNG-${body.category}-${Date.now().toString().slice(-6)}`;

    // 1. Insert Item
    const newItem = {
      id: itemId,
      item_code: itemCode,
      consignor_id: user.id,
      category: body.category,
      brand: body.brand,
      model: body.model,
      condition: body.condition,
      usage_duration: body.usage_duration,
      completeness: body.completeness,
      specifications: { category: body.category },
      photos: [body.photo_url],
      declaration_own_item: true,
      expected_price: body.expected_price,
      min_price: body.min_price,
      status: "Diajukan",
      extension_used: false,
      withdrawal_requested: false,
      view_count: 0,
      created_at: new Date().toISOString(),
    };

    const { error: itemErr } = await supabaseAdmin.from("items").insert(newItem);
    if (itemErr) {
      return NextResponse.json({ error: itemErr.message }, { status: 500 });
    }

    // 2. Insert Identity Documents
    await supabaseAdmin.from("identity_documents").insert({
      id: randomUUID(),
      item_id: itemId,
      consignor_id: user.id,
      ktp_file_url: body.ktp_url,
      ownership_proof_url: body.ownership_proof_url,
      ownership_proof_type: body.ownership_proof_type,
      status: "TERVERIFIKASI_AWAL",
      is_purged: false,
      created_at: new Date().toISOString(),
    });

    // 3. Insert Terms Acceptance
    await supabaseAdmin.from("terms_acceptances").insert({
      id: randomUUID(),
      item_id: itemId,
      consignor_id: user.id,
      fee_terms_accepted: true,
      shipping_terms_accepted: true,
      warranty_and_payout_accepted: true,
      price_proposal_schedule_accepted: true,
      end_of_term_rules_accepted: true,
      accepted_at: new Date().toISOString(),
    });

    // 4. Record Status History
    await supabaseAdmin.from("status_history").insert({
      item_id: itemId,
      from_status: null,
      to_status: "Diajukan",
      actor_id: user.id,
      actor_role: "USER",
      notes: "Pengajuan titip jual baru via website",
    });

    return NextResponse.json({ success: true, itemId, itemCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
