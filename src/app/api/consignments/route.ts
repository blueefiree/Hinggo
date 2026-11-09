import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

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
    const userEmailNorm = user.email?.trim()?.toLowerCase();

    // ====================================================================
    // ATURAN 2: FILTER BERDASARKAN EMAIL PENGGUNA (sellerEmail || sellerId)
    // ====================================================================
    const where: any = {};
    if (!isAdmin) {
      where.OR = [
        ...(userEmailNorm ? [{ sellerEmail: userEmailNorm }] : []),
        { sellerId: user.id },
      ];
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
      const searchCond = [
        { code: { contains: search } },
        { brandModel: { contains: search } },
        { variantSpec: { contains: search } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchCond }];
        delete where.OR;
      } else {
        where.OR = searchCond;
      }
    }

    let items = await prisma.consignmentItem.findMany({
      where,
      include: {
        timeline: { orderBy: { stepOrder: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Dual-Read Fallback: Jika di Prisma kosong, cek Supabase cloud
    if (items.length === 0 && !isAdmin) {
      try {
        let sbQuery = supabase.from("consignments").select("*");
        if (userEmailNorm) {
          sbQuery = sbQuery.or(`seller_email.eq.${userEmailNorm},seller_id.eq.${user.id}`);
        } else {
          sbQuery = sbQuery.eq("seller_id", user.id);
        }

        const { data: sbItems } = await sbQuery.order("created_at", { ascending: false });

        if (sbItems && sbItems.length > 0) {
          const mapped = sbItems.map((s: any) => ({
            id: s.id,
            code: s.code,
            sellerId: s.seller_id,
            sellerEmail: s.seller_email || userEmailNorm,
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
          }));

          return NextResponse.json({ consignments: mapped });
        }
      } catch (sbErr) {
        console.warn("Supabase consignments fetch notice:", sbErr);
      }
    }

    const parsedItems = items.map((item) => {
      let parsedPhotos: string[] = [];
      try {
        parsedPhotos = typeof item.photos === "string" ? JSON.parse(item.photos || "[]") : item.photos;
      } catch {
        parsedPhotos = [];
      }
      return {
        ...item,
        photos: parsedPhotos,
      };
    });

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

    const sellerEmail = user.email?.trim()?.toLowerCase() || (user.phone ? `${user.phone.replace(/\D/g, "")}@wa.hingo.id` : null);

    const photosArr = Array.isArray(data.photos) && data.photos.length > 0
      ? data.photos
      : [
          "https://images.unsplash.com/photo-1587829741301-dc798b83add3?q=80&w=800&auto=format&fit=crop",
        ];

    const newItem = await prisma.$transaction(async (tx) => {
      const item = await tx.consignmentItem.create({
        data: {
          code,
          sellerId: user.id,
          sellerEmail,
          category: data.category || "KEYBOARD",
          brandModel: data.brandModel || "Gear Baru",
          variantSpec: data.variantSpec || "Varian Standar",
          usageDuration: data.usageDuration || "3 bulan",
          additionalSpecs: data.additionalSpecs || "",
          currentCondition: data.currentCondition || "Bekas · berfungsi normal",
          defectDetails: data.defectDetails || "Tidak ada cacat fungsi",
          completeness: data.completeness || "Unit dan kelengkapan standar",
          photos: JSON.stringify(photosArr),
          expectedPrice,
          consignmentFeePercent,
          consignmentFeeAmount,
          adminHandlingFee,
          estimatedNetPayout,
          originCity: data.originCity || user.city || "Jakarta Selatan",
          handoverMethod: data.handoverMethod || "Kirim ke Gudang Hingo via kurir ekspedisi",
          stage,
          actionActor: "HINGO",
          badgeLabel: isDraft ? "Draf tersimpan" : "Menunggu kurasi online",
          statusSummary: isDraft
            ? "Draf titip jual tersimpan di akunmu."
            : "Formulir titip jual telah dikirim. Tim Hingo sedang memeriksa foto online.",
        },
      });

      await tx.consignmentTimeline.create({
        data: {
          consignmentId: item.id,
          stepOrder: 1,
          title: isDraft ? "Draf pengajuan dibuat" : "Pengajuan titip jual diterima",
          description: isDraft
            ? "Draf pengajuan barang titipan disimpan oleh penjual."
            : "Data spesifikasi dan foto gear berhasil dikirimkan.",
          timestampText: "Hari ini · Baru saja",
          state: "CURRENT",
        },
      });

      return item;
    });

    // ====================================================================
    // DUAL-WRITE KE SUPABASE public.consignments (Cloud Backup)
    // ====================================================================
    try {
      await supabase.from("consignments").insert({
        id: newItem.id,
        code: newItem.code,
        seller_id: user.id,
        seller_email: sellerEmail,
        category: newItem.category,
        brand_model: newItem.brandModel,
        variant_spec: newItem.variantSpec,
        usage_duration: newItem.usageDuration,
        additional_specs: newItem.additionalSpecs,
        current_condition: newItem.currentCondition,
        defect_details: newItem.defectDetails,
        completeness: newItem.completeness,
        photos: JSON.stringify(photosArr),
        expected_price: newItem.expectedPrice,
        consignment_fee_percent: newItem.consignmentFeePercent,
        consignment_fee_amount: newItem.consignmentFeeAmount,
        admin_handling_fee: newItem.adminHandlingFee,
        estimated_net_payout: newItem.estimatedNetPayout,
        origin_city: newItem.originCity,
        handover_method: newItem.handoverMethod,
        stage: newItem.stage,
        action_actor: newItem.actionActor,
        badge_label: newItem.badgeLabel,
        status_summary: newItem.statusSummary,
      });
    } catch (sbErr) {
      console.warn("Supabase consignment sync notice:", sbErr);
    }

    revalidatePath("/seller/consignments");
    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      item: {
        ...newItem,
        photos: photosArr,
      },
      message: isDraft
        ? "Draf berhasil disimpan permanen di akunmu."
        : "Pengajuan titip jual berhasil dikirim ke database! Tim kurator Hingo akan mereview dalam 1×24 jam.",
      redirectTo: `/seller/consignments`,
    });
  } catch (error: any) {
    console.error("Consignments POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
