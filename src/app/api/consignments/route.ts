import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ consignments: [] });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");

    const isAdmin = user.role === "ADMIN";

    const where: any = {};
    if (!isAdmin) {
      where.sellerId = user.id;
    }

    if (stage && stage !== "ALL") {
      if (stage === "ACTION_NEEDED") {
        where.stage = { in: ["ONLINE_CHECK_PASSED", "INSPECTION_COMPLETED", "REVISION_NEEDED", "RETURN_DISCUSSED"] };
      } else if (stage === "IN_PROGRESS") {
        where.stage = { in: ["ONLINE_CHECK", "SHIPPING_TO_HINGO", "RECEIVED_AT_HINGO"] };
      } else if (stage === "MARKETING") {
        where.stage = "PRICE_AGREED_MARKETING";
      } else if (stage === "COMPLETED") {
        where.stage = "PAYOUT_COMPLETED";
      }
    }

    if (search) {
      where.OR = [
        { code: { contains: search } },
        { brandModel: { contains: search } },
        { variantSpec: { contains: search } },
      ];
    }

    const items = await prisma.consignmentItem.findMany({
      where,
      include: {
        timeline: { orderBy: { stepOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const parsedItems = items.map((item) => ({
      ...item,
      photos: JSON.parse(item.photos || "[]"),
    }));

    return NextResponse.json({ consignments: parsedItems });
  } catch (error: any) {
    console.error("Consignments API error:", error.message);
    return NextResponse.json({ consignments: [] });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const data = await req.json();

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900).toString();
    const code = `HG-${dateStr}-${randomSuffix}`;

    const expectedPrice = parseInt(data.expectedPrice || "0", 10);
    const consignmentFeePercent = 8;
    const consignmentFeeAmount = Math.round(expectedPrice * 0.08);
    const adminHandlingFee = 19000;
    const estimatedNetPayout = expectedPrice - consignmentFeeAmount - adminHandlingFee;

    const isDraft = data.isDraft === true;
    const stage = isDraft ? "DRAFT" : "ONLINE_CHECK";

    const newItem = await prisma.$transaction(async (tx) => {
      const item = await tx.consignmentItem.create({
        data: {
          code,
          sellerId: user.id,
          category: data.category || "KEYBOARD",
          brandModel: data.brandModel || "Gear Baru",
          variantSpec: data.variantSpec || "Varian Standar",
          usageDuration: data.usageDuration || "3 bulan",
          additionalSpecs: data.additionalSpecs || "",
          currentCondition: data.currentCondition || "Bekas · berfungsi normal",
          defectDetails: data.defectDetails || "Tidak ada cacat fungsi",
          completeness: data.completeness || "Unit dan kelengkapan standar",
          photos: JSON.stringify(data.photos || [
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
          ]),
          expectedPrice,
          consignmentFeePercent,
          consignmentFeeAmount,
          adminHandlingFee,
          estimatedNetPayout,
          originCity: data.originCity || user.city || "Jakarta Selatan",
          handoverMethod: data.handoverMethod || "Kirim ke Gudang Hingo via kurir ekspedisi",
          stage,
          actionActor: "HINGO",
          badgeLabel: "Menunggu kurasi online",
          statusSummary: "Formulir titip jual telah dikirim. Tim Hingo sedang memeriksa foto online.",
        },
      });

      await tx.consignmentTimeline.create({
        data: {
          consignmentId: item.id,
          stepOrder: 1,
          title: "Pengajuan titip jual diterima",
          description: "Data spesifikasi dan foto gear berhasil dikirimkan.",
          timestampText: "Hari ini · Baru saja",
          state: "CURRENT",
        },
      });

      return item;
    });

    return NextResponse.json({
      success: true,
      item: newItem,
      redirectTo: `/seller/consignments`,
    });
  } catch (error: any) {
    console.error("Consignments POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
