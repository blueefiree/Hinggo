import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const item = await prisma.consignmentItem.findUnique({
      where: { code },
      include: {
        timeline: { orderBy: { stepOrder: "asc" } },
      },
    });

    if (!item) {
      // Fallback cek Supabase cloud
      try {
        const { data: sbItems } = await supabase
          .from("consignments")
          .select("*")
          .eq("code", code)
          .limit(1);

        if (sbItems && sbItems.length > 0) {
          const s = sbItems[0];
          return NextResponse.json({
            consignment: {
              id: s.id,
              code: s.code,
              sellerId: s.seller_id,
              sellerEmail: s.seller_email,
              category: s.category,
              brandModel: s.brand_model || s.brandModel,
              variantSpec: s.variant_spec || s.variantSpec,
              usageDuration: s.usage_duration || s.usageDuration,
              additionalSpecs: s.additional_specs || s.additionalSpecs || "",
              currentCondition: s.current_condition || s.currentCondition,
              defectDetails: s.defect_details || s.defectDetails,
              completeness: s.completeness,
              photos: typeof s.photos === "string" ? JSON.parse(s.photos || "[]") : (s.photos || []),
              expectedPrice: s.expected_price || s.expectedPrice,
              proposedPrice: s.proposed_price || s.proposedPrice,
              consignmentFeePercent: s.consignment_fee_percent || 8,
              consignmentFeeAmount: s.consignment_fee_amount || null,
              adminHandlingFee: s.admin_handling_fee || 19000,
              estimatedNetPayout: s.estimated_net_payout || null,
              actualNetPayout: s.actual_net_payout || null,
              originCity: s.origin_city || "Jakarta",
              handoverMethod: s.handover_method || "Kirim via kurir",
              stage: s.stage || "ONLINE_CHECK",
              actionActor: s.action_actor || "HINGO",
              badgeLabel: s.badge_label || "Menunggu kurasi",
              statusSummary: s.status_summary || "",
              timeline: [],
              updatedAt: s.updated_at ? new Date(s.updated_at) : new Date(),
            },
          });
        }
      } catch {}

      return NextResponse.json({ error: "Barang titipan tidak ditemukan" }, { status: 404 });
    }

    let parsedPhotos: string[] = [];
    try {
      parsedPhotos = typeof item.photos === "string" ? JSON.parse(item.photos || "[]") : item.photos;
    } catch {
      parsedPhotos = [];
    }

    return NextResponse.json({
      consignment: {
        ...item,
        photos: parsedPhotos,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();
    const { action } = body;

    const item = await prisma.consignmentItem.findUnique({
      where: { code },
      include: { seller: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Barang titipan tidak ditemukan" }, { status: 404 });
    }

    if (action === "SUBMIT_SHIPMENT") {
      const { courier, trackingNumber } = body;
      const updated = await prisma.$transaction(async (tx) => {
        const res = await tx.consignmentItem.update({
          where: { code },
          data: {
            stage: "SHIPPING_TO_HINGO",
            inboundCourier: courier,
            inboundTrackingNumber: trackingNumber,
            handoverMethod: `${courier} · Resi ${trackingNumber}`,
            badgeLabel: "Dalam kiriman ke Hingo",
            statusSummary: `${courier} · ${trackingNumber} dalam perjalanan ke Gudang Hingo Jakarta Selatan`,
            actionActor: "HINGO",
          },
        });

        await tx.consignmentTimeline.create({
          data: {
            consignmentId: item.id,
            stepOrder: 2,
            title: "Paket dikirim ke Gudang Hingo",
            description: `${courier} - Resi ${trackingNumber}. Menunggu paket tiba di fasilitas inspeksi.`,
            timestampText: "Hari ini · Dalam perjalanan",
            state: "CURRENT",
          },
        });

        return res;
      });

      return NextResponse.json({ success: true, consignment: updated });
    }

    if (action === "APPROVE_PRICE") {
      const proposedPrice = body.proposedPrice || item.proposedPrice || item.expectedPrice;
      const consignmentFee = Math.round(proposedPrice * 0.08);
      const handlingFee = 19000;
      const netPayout = proposedPrice - consignmentFee - handlingFee;

      const slug = `${item.brandModel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${code.toLowerCase()}`;

      const updated = await prisma.$transaction(async (tx) => {
        // 1. Update consignment item
        const c = await tx.consignmentItem.update({
          where: { code },
          data: {
            stage: "PRICE_AGREED_MARKETING",
            proposedPrice,
            consignmentFeeAmount: consignmentFee,
            actualNetPayout: netPayout,
            badgeLabel: "Sedang dipasarkan",
            statusSummary: `Harga jual disepakati Rp${proposedPrice.toLocaleString("id-ID")}. Tim kurator sedang mempublikasikan iklan.`,
            actionActor: "HINGO",
          },
        });

        // 2. Add timeline entry
        await tx.consignmentTimeline.create({
          data: {
            consignmentId: item.id,
            stepOrder: 4,
            title: "Harga disetujui — Mulai dipasarkan",
            description: `Harga Rp${proposedPrice.toLocaleString("id-ID")} disetujui. Hasil bersih Rp${netPayout.toLocaleString("id-ID")}.`,
            timestampText: "Baru saja",
            state: "COMPLETED",
          },
        });

        // 3. AUTOMATICALLY PUBLISH TO PRODUCT CATALOG TABLE
        const existingProduct = await tx.product.findFirst({
          where: { consignmentItemId: item.id },
        });

        if (!existingProduct) {
          await tx.product.create({
            data: {
              code: `HG-${code.slice(-4)}`,
              slug,
              consignmentItemId: item.id,
              sellerId: item.sellerId,
              brand: item.brandModel.split(" ")[0].toUpperCase(),
              name: item.brandModel,
              subtitle: `${item.variantSpec} · Terverifikasi Fisik`,
              category: item.category,
              condition: "SANGAT_BAIK",
              usageDuration: item.usageDuration,
              switchOrVariant: item.variantSpec,
              completeness: item.completeness,
              description: `Gear titip jual lolos inspeksi fisik ketat Hingo. ${item.additionalSpecs}`,
              defectNotes: item.defectDetails,
              price: proposedPrice,
              originalNewPrice: Math.round(proposedPrice * 1.5),
              stock: 1,
              location: "Jakarta Selatan",
              rating: 5.0,
              soldCount: 0,
              isVerifiedByTeam: true,
              images: item.photos,
              status: "AVAILABLE",
            },
          });
        }

        return c;
      });

      return NextResponse.json({
        success: true,
        consignment: updated,
        message: "Harga disetujui dan gear otomatis diterbitkan ke katalog belanja Hingo!",
      });
    }

    if (action === "SUBMIT_REVISION") {
      const { updatedPhotos = [], revisionNotes = "" } = body;
      const updated = await prisma.consignmentItem.update({
        where: { code },
        data: {
          stage: "ONLINE_CHECK",
          photos: JSON.stringify(updatedPhotos),
          defectDetails: `${item.defectDetails} | Catatan revisi: ${revisionNotes}`,
          badgeLabel: "Menunggu kurasi ulang",
          statusSummary: "Foto revisi telah diunggah. Tim kurator mereview ulang dalam 1×24 jam.",
          actionActor: "HINGO",
        },
      });
      return NextResponse.json({ success: true, consignment: updated });
    }

    if (action === "REQUEST_RETURN") {
      const { returnOption } = body;
      const updated = await prisma.consignmentItem.update({
        where: { code },
        data: {
          stage: "RETURN_DISCUSSED",
          badgeLabel: "Proses pengembalian barang",
          statusSummary: `Barang dijadwalkan retur (${returnOption || "Kirim balik via Ekspedisi"}). Logistik Hingo sedang menyiapkan paket pengembalian.`,
          actionActor: "HINGO",
        },
      });
      return NextResponse.json({ success: true, consignment: updated });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
