import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { validateTransition } from "@/lib/state-machine";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const itemId = params.id;
    const { toStatus, notes, rejectionReason, trackingNumber, testChecklist, youtubeUrl } = await req.json();

    // Fetch current item
    const { data: item, error: fetchErr } = await supabaseAdmin
      .from("items")
      .select("*")
      .eq("id", itemId)
      .single();

    if (fetchErr || !item) {
      return NextResponse.json({ error: "Barang tidak ditemukan." }, { status: 404 });
    }

    // Validate transition
    const validation = validateTransition(item.status, toStatus, user.role);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.reason }, { status: 400 });
    }

    const updates: Record<string, any> = {
      status: toStatus,
      updated_at: new Date().toISOString(),
    };

    if (rejectionReason) updates.rejection_reason = rejectionReason;
    if (notes) updates.rejection_notes = notes;
    if (trackingNumber) {
      if (item.status === "Disetujui, menunggu kiriman") {
        updates.inbound_tracking_number = trackingNumber;
        updates.inbound_shipped_at = new Date().toISOString();
      }
    }

    // If transitioned to 'Tayang', record first_listed_at and 60 days listing_ends_at
    if (toStatus === "Tayang" && !item.first_listed_at) {
      const now = new Date();
      updates.first_listed_at = now.toISOString();
      updates.listing_ends_at = new Date(now.getTime() + 60 * 24 * 3600 * 1000).toISOString();
      if (!item.current_listing_price) {
        updates.current_listing_price = item.expected_price;
      }
    }

    const { error: updateErr } = await supabaseAdmin
      .from("items")
      .update(updates)
      .eq("id", itemId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // Record audit status history (Append-only)
    await supabaseAdmin.from("status_history").insert({
      item_id: itemId,
      from_status: item.status,
      to_status: toStatus,
      actor_id: user.id,
      actor_role: user.role,
      notes: notes || `Transisi status ke '${toStatus}' oleh ${user.name}`,
    });

    return NextResponse.json({ success: true, newStatus: toStatus });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
