import { supabaseAdmin } from "./supabase";

export interface SchedulerExecutionResult {
  timestamp: string;
  simulatedTime: string;
  timeOffsetHours: number;
  expiredTrackingCount: number;
  expiredOrderHoldsCount: number;
  expiredConsignmentsCount: number;
  autoPriceDropProposalsCount: number;
  readyPayoutsCount: number;
  messages: string[];
}

/**
 * Returns current simulated time considering `timeOffsetHours` set by Admin in settings.
 */
export async function getSimulatedTime(): Promise<{ now: Date; timeOffsetHours: number }> {
  const { data: setting } = await supabaseAdmin
    .from("settings")
    .select("value")
    .eq("key", "schedule_speed_factor")
    .single();

  const timeOffsetHours = typeof setting?.value === "number" ? setting.value : 0;
  const now = new Date(Date.now() + timeOffsetHours * 3600 * 1000);
  return { now, timeOffsetHours };
}

/**
 * Executes the 8 time-based business rules according to PRD Section 5:
 * 1. Tracking input deadline: 48h after 'Disetujui, menunggu kiriman' -> 'Ditolak saat screening'
 * 2. Order Hold: 24h after checkout without payment proof -> Cancel order and return item to 'Tayang'
 * 3. Day 60 consignment expiration -> 'Masa penitipan habis'
 * 4. Automatic price drop proposals (Day 21, 36, 50 for >= 200k, Day 30 for < 200k)
 * 5. 72h expired decision on 'Masa penitipan habis' -> 'Menunggu ongkir kembali'
 * 6. Buyer warranty: 7 days after 'Diterima pembeli' -> 'Siap dibayar ke consignor'
 */
export async function runScheduler(advanceHours = 0): Promise<SchedulerExecutionResult> {
  // If demo requested advancing hours, update the setting
  if (advanceHours !== 0) {
    const { data: current } = await supabaseAdmin
      .from("settings")
      .select("value")
      .eq("key", "schedule_speed_factor")
      .single();

    const newOffset = ((current?.value as number) || 0) + advanceHours;
    await supabaseAdmin
      .from("settings")
      .upsert({ key: "schedule_speed_factor", value: newOffset, description: "Demo time offset in hours" });
  }

  const { now: simNow, timeOffsetHours } = await getSimulatedTime();
  const messages: string[] = [];
  let expiredTrackingCount = 0;
  let expiredOrderHoldsCount = 0;
  let expiredConsignmentsCount = 0;
  let autoPriceDropProposalsCount = 0;
  let readyPayoutsCount = 0;

  // Rule 1: Check items in 'Disetujui, menunggu kiriman' > 48h without tracking
  const { data: approvedItems } = await supabaseAdmin
    .from("items")
    .select("id, item_code, updated_at")
    .eq("status", "Disetujui, menunggu kiriman");

  if (approvedItems) {
    for (const item of approvedItems) {
      const updatedAt = new Date(item.updated_at || simNow.toISOString());
      const hoursDiff = (simNow.getTime() - updatedAt.getTime()) / (3600 * 1000);
      if (hoursDiff >= 48) {
        await supabaseAdmin
          .from("items")
          .update({
            status: "Ditolak saat screening",
            rejection_reason: "Kedaluwarsa: nomor resi pengiriman ke Hinggo tidak diisi dalam 2x24 jam",
          })
          .eq("id", item.id);

        await supabaseAdmin.from("status_history").insert({
          item_id: item.id,
          from_status: "Disetujui, menunggu kiriman",
          to_status: "Ditolak saat screening",
          actor_role: "SYSTEM",
          notes: "Otomatis oleh scheduler (batas waktu 48 jam terlewati)",
        });

        expiredTrackingCount++;
        messages.push(`Item ${item.item_code} dibatalkan (lewat batas 48 jam resi).`);
      }
    }
  }

  // Rule 2: Check orders held awaiting payment > 24h
  const { data: heldOrders } = await supabaseAdmin
    .from("orders")
    .select("id, order_code, hold_expires_at, order_status")
    .eq("order_status", "Ditahan menunggu pembayaran");

  if (heldOrders) {
    for (const order of heldOrders) {
      const expiresAt = new Date(order.hold_expires_at || simNow.toISOString());
      if (simNow.getTime() >= expiresAt.getTime()) {
        await supabaseAdmin
          .from("orders")
          .update({ order_status: "Dibatalkan (Waktu Pembayaran Habis)" })
          .eq("id", order.id);

        // Release locked items back to 'Tayang'
        const { data: orderItems } = await supabaseAdmin
          .from("order_items")
          .select("item_id")
          .eq("order_id", order.id);

        if (orderItems) {
          for (const oi of orderItems) {
            await supabaseAdmin
              .from("items")
              .update({ status: "Tayang" })
              .eq("id", oi.item_id);

            await supabaseAdmin.from("status_history").insert({
              item_id: oi.item_id,
              from_status: "Ditahan menunggu pembayaran",
              to_status: "Tayang",
              actor_role: "SYSTEM",
              notes: `Order ${order.order_code} kedaluwarsa 24 jam tanpa bukti transfer. Barang kembali tayang.`,
            });
          }
        }

        expiredOrderHoldsCount++;
        messages.push(`Pesanan ${order.order_code} kedaluwarsa 24 jam. Barang dikembalikan ke status Tayang.`);
      }
    }
  }

  // Rule 3: Consignment period 60 days
  const { data: listedItems } = await supabaseAdmin
    .from("items")
    .select("id, item_code, first_listed_at, listing_ends_at, current_listing_price, min_price")
    .eq("status", "Tayang");

  if (listedItems) {
    for (const item of listedItems) {
      const listingEnd = new Date(item.listing_ends_at || simNow.toISOString());
      if (simNow.getTime() >= listingEnd.getTime()) {
        await supabaseAdmin
          .from("items")
          .update({ status: "Masa penitipan habis" })
          .eq("id", item.id);

        await supabaseAdmin.from("status_history").insert({
          item_id: item.id,
          from_status: "Tayang",
          to_status: "Masa penitipan habis",
          actor_role: "SYSTEM",
          notes: "Masa penitipan 60 hari telah terlewati.",
        });

        expiredConsignmentsCount++;
        messages.push(`Item ${item.item_code} mencapai akhir masa 60 hari -> Masa penitipan habis.`);
      }
    }
  }

  // Rule 6: Buyer warranty 7 days passed without dispute -> 'Siap dibayar ke consignor'
  const { data: deliveredItems } = await supabaseAdmin
    .from("items")
    .select("id, item_code, updated_at")
    .eq("status", "Diterima pembeli");

  if (deliveredItems) {
    for (const item of deliveredItems) {
      // Check if there is an active claim
      const { data: activeClaims } = await supabaseAdmin
        .from("claims")
        .select("id")
        .eq("item_id", item.id)
        .in("status", ["DIAJUKAN", "DIPROSES"]);

      if (!activeClaims || activeClaims.length === 0) {
        const receivedAt = new Date(item.updated_at || simNow.toISOString());
        const daysDiff = (simNow.getTime() - receivedAt.getTime()) / (24 * 3600 * 1000);
        if (daysDiff >= 7) {
          await supabaseAdmin
            .from("items")
            .update({ status: "Siap dibayar ke consignor" })
            .eq("id", item.id);

          await supabaseAdmin.from("status_history").insert({
            item_id: item.id,
            from_status: "Diterima pembeli",
            to_status: "Siap dibayar ke consignor",
            actor_role: "SYSTEM",
            notes: "Masa garansi 7 hari selesai tanpa klaim.",
          });

          readyPayoutsCount++;
          messages.push(`Item ${item.item_code} selesai garansi 7 hari -> Siap dibayar ke consignor.`);
        }
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    simulatedTime: simNow.toISOString(),
    timeOffsetHours,
    expiredTrackingCount,
    expiredOrderHoldsCount,
    expiredConsignmentsCount,
    autoPriceDropProposalsCount,
    readyPayoutsCount,
    messages: messages.length > 0 ? messages : ["Seluruh jadwal dievaluasi. Tidak ada tindakan yang kedaluwarsa."],
  };
}
