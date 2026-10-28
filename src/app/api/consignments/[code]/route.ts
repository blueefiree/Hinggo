import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Barang titipan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      consignment: {
        ...item,
        photos: JSON.parse(item.photos || "[]"),
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
