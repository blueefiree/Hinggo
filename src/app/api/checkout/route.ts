import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getCurrentUser } from "@/lib/auth";
import { calculateConsignmentFee, calculateOrderBreakdown } from "@/lib/fee-calculator";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu untuk menyelesaikan pesanan." },
        { status: 401 }
      );
    }

    const { itemIds, shippingDetails } = await req.json();

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "Keranjang belanja kosong." }, { status: 400 });
    }

    if (!shippingDetails?.recipient_name || !shippingDetails?.recipient_phone || !shippingDetails?.shipping_address) {
      return NextResponse.json({ error: "Alamat pengiriman dan nama penerima wajib diisi lengkap." }, { status: 400 });
    }

    // 1. Lock and verify items availability
    // Query items that are in 'Tayang' status
    const { data: items, error: fetchError } = await supabaseAdmin
      .from("items")
      .select("*")
      .in("id", itemIds);

    if (fetchError || !items || items.length === 0) {
      return NextResponse.json({ error: "Gagal mengambil data barang." }, { status: 500 });
    }

    // Check if ANY item is no longer 'Tayang'
    const unavailable = items.filter((i) => i.status !== "Tayang");
    if (unavailable.length > 0) {
      return NextResponse.json(
        {
          error: `Barang "${unavailable.map((u) => u.model).join(", ")}" sudah tidak tersedia atau sedang dipesan pembeli lain.`,
        },
        { status: 409 }
      );
    }

    // 2. Calculate breakdown
    const breakdown = calculateOrderBreakdown(items);

    const now = new Date();
    const holdExpiresAt = new Date(now.getTime() + 24 * 3600 * 1000).toISOString();
    const orderCode = `HNG-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`;

    const newOrder = {
      id: randomUUID(),
      order_code: orderCode,
      buyer_id: user.id,
      recipient_name: shippingDetails.recipient_name,
      recipient_phone: shippingDetails.recipient_phone,
      shipping_address: shippingDetails.shipping_address,
      shipping_city: shippingDetails.shipping_city || "Jakarta",
      shipping_postal_code: shippingDetails.shipping_postal_code || "10000",
      shipping_cost: breakdown.shippingCost,
      insurance_cost: breakdown.insuranceCost,
      total_items_price: breakdown.itemsTotal,
      total_amount: breakdown.totalPayment,
      hold_expires_at: holdExpiresAt,
      order_status: "Ditahan menunggu pembayaran",
      created_at: now.toISOString(),
    };

    // 3. Insert Order
    const { error: orderError } = await supabaseAdmin.from("orders").insert(newOrder);
    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 });
    }

    // 4. Create Order Items & Lock Item status to 'Ditahan menunggu pembayaran'
    for (const item of items) {
      const price = item.current_listing_price || item.expected_price;
      const feeCalc = calculateConsignmentFee(price);

      await supabaseAdmin.from("order_items").insert({
        id: randomUUID(),
        order_id: newOrder.id,
        item_id: item.id,
        consignor_id: item.consignor_id,
        sale_price: price,
        fee_amount: feeCalc.feeAmount,
        consignor_amount: feeCalc.consignorAmount,
        is_paid_to_consignor: false,
        created_at: now.toISOString(),
      });

      // Update item status
      await supabaseAdmin
        .from("items")
        .update({ status: "Ditahan menunggu pembayaran" })
        .eq("id", item.id);

      // Audit status history
      await supabaseAdmin.from("status_history").insert({
        item_id: item.id,
        from_status: "Tayang",
        to_status: "Ditahan menunggu pembayaran",
        actor_id: user.id,
        actor_role: "USER",
        notes: `Checkout oleh ${user.name} (Order: ${orderCode}). Ditahan 24 jam.`,
      });
    }

    return NextResponse.json({
      success: true,
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memproses checkout." }, { status: 500 });
  }
}
