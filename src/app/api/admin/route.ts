import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Ambil data dari Prisma
    const [kycDocs, consignments, orders, users, products] = await Promise.all([
      prisma.kycDocument.findMany({
        include: { user: true },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.consignmentItem.findMany({
        include: {
          seller: true,
          timeline: { orderBy: { stepOrder: "asc" } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.order.findMany({
        include: {
          buyer: true,
          product: true,
          address: true,
          timeline: { orderBy: { stepOrder: "asc" } },
          disputes: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // 2. Cek status koneksi Supabase & keberadaan tabel
    let supabaseConnected = false;
    const tablesStatus: Record<string, boolean> = {
      products: false,
      users: false,
      consignments: false,
      orders: false,
    };

    try {
      const [prodRes, userRes, consRes, orderRes] = await Promise.all([
        supabase.from("products").select("id").limit(1),
        supabase.from("users").select("id").limit(1),
        supabase.from("consignments").select("id").limit(1),
        supabase.from("orders").select("id").limit(1),
      ]);

      tablesStatus.products = !prodRes.error;
      tablesStatus.users = !userRes.error;
      tablesStatus.consignments = !consRes.error;
      tablesStatus.orders = !orderRes.error;
      supabaseConnected = true;
    } catch {
      supabaseConnected = false;
    }

    // 3. Dual-Read Fallback dari Supabase jika Prisma SQLite lokal kosong
    let finalProducts: any[] = products;
    let finalConsignments: any[] = consignments;
    let finalOrders: any[] = orders;
    let finalUsers: any[] = users;

    if (products.length === 0 || consignments.length === 0 || orders.length === 0) {
      try {
        const [sbProd, sbCons, sbOrders, sbUsers] = await Promise.all([
          supabase.from("products").select("*").order("created_at", { ascending: false }),
          supabase.from("consignments").select("*").order("created_at", { ascending: false }),
          supabase.from("orders").select("*").order("created_at", { ascending: false }),
          supabase.from("users").select("*").order("created_at", { ascending: false }),
        ]);

        if (products.length === 0 && sbProd.data && sbProd.data.length > 0) {
          finalProducts = sbProd.data.map((item: any) => ({
            id: item.id,
            code: item.code,
            slug: item.slug,
            brand: item.brand,
            name: item.name,
            subtitle: item.subtitle,
            category: item.category,
            condition: item.condition,
            usageDuration: item.usage_duration,
            switchOrVariant: item.switch_or_variant,
            completeness: item.completeness,
            description: item.description,
            defectNotes: item.defect_notes,
            price: Number(item.price),
            originalNewPrice: Number(item.original_new_price || 0),
            stock: item.stock || 1,
            location: item.location || "Jakarta Selatan",
            rating: Number(item.rating || 5.0),
            soldCount: item.sold_count || 0,
            isVerifiedByTeam: Boolean(item.is_verified_by_team),
            images: Array.isArray(item.images) ? JSON.stringify(item.images) : (item.images || "[]"),
            status: item.status || "AVAILABLE",
            createdAt: new Date(item.created_at || Date.now()),
          }));
        }

        if (consignments.length === 0 && sbCons.data && sbCons.data.length > 0) {
          finalConsignments = sbCons.data.map((item: any) => ({
            id: item.id,
            code: item.code,
            sellerId: item.seller_id,
            sellerEmail: item.seller_email,
            category: item.category,
            brandModel: item.brand_model,
            variantSpec: item.variant_spec,
            usageDuration: item.usage_duration,
            currentCondition: item.current_condition,
            completeness: item.completeness,
            photos: Array.isArray(item.photos) ? JSON.stringify(item.photos) : (item.photos || "[]"),
            expectedPrice: item.expected_price,
            proposedPrice: item.proposed_price,
            consignmentFeeAmount: item.consignment_fee,
            estimatedNetPayout: item.estimated_net_payout,
            originCity: item.origin_city,
            stage: item.stage,
            badgeLabel: item.badge_label,
            statusSummary: item.status_summary,
            timeline: [],
            seller: null,
            createdAt: new Date(item.created_at || Date.now()),
            updatedAt: new Date(item.updated_at || Date.now()),
          }));
        }

        if (orders.length === 0 && sbOrders.data && sbOrders.data.length > 0) {
          finalOrders = sbOrders.data.map((item: any) => ({
            id: item.id,
            orderCode: item.order_code,
            buyerId: item.buyer_id,
            buyerEmail: item.buyer_email,
            productId: item.product_id,
            itemPrice: item.item_price,
            shippingCourier: item.shipping_courier,
            shippingCost: item.shipping_cost,
            shippingProtection: item.shipping_protection,
            serviceFee: item.service_fee,
            totalAmount: item.total_amount,
            paymentMethod: item.payment_method,
            trackingNumber: item.tracking_number,
            escrowStatus: item.escrow_status,
            orderStatus: item.order_status,
            timeline: [],
            product: null,
            buyer: null,
            address: null,
            disputes: [],
            createdAt: new Date(item.created_at || Date.now()),
          }));
        }

        if (users.length === 0 && sbUsers.data && sbUsers.data.length > 0) {
          finalUsers = sbUsers.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            email: item.email,
            phone: item.phone,
            city: item.city,
            bio: item.bio,
            role: item.role,
            phoneVerified: item.phone_verified,
            emailVerified: item.email_verified,
            kycStatus: item.kyc_status,
            createdAt: new Date(item.created_at || Date.now()),
          }));
        }
      } catch {}
    }

    return NextResponse.json({
      products: finalProducts.map((p) => {
        let parsedImages: string[] = [];
        try {
          parsedImages = JSON.parse(p.images || "[]");
        } catch {
          parsedImages = p.images ? (Array.isArray(p.images) ? p.images : [p.images]) : [];
        }
        return {
          ...p,
          images: parsedImages,
        };
      }),
      kycDocs,
      consignments: finalConsignments.map((c) => {
        let parsedPhotos: string[] = [];
        try {
          parsedPhotos = JSON.parse(c.photos || "[]");
        } catch {
          parsedPhotos = c.photos ? (Array.isArray(c.photos) ? c.photos : [c.photos]) : [];
        }
        return {
          ...c,
          photos: parsedPhotos,
        };
      }),
      orders: finalOrders.map((o) => {
        let parsedImages: string[] = [];
        if (o.product?.images) {
          try {
            parsedImages = JSON.parse(o.product.images || "[]");
          } catch {
            parsedImages = Array.isArray(o.product.images) ? o.product.images : [o.product.images];
          }
        }
        return {
          ...o,
          product: o.product
            ? {
                ...o.product,
                images: parsedImages,
              }
            : null,
        };
      }),
      users: finalUsers,
      supabaseStatus: {
        connected: supabaseConnected,
        url: "https://obdczozspvkdebhtyhoh.supabase.co",
        tables: tablesStatus,
        allTablesCreated: Object.values(tablesStatus).every(Boolean),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. SINKRONISASI DATA LOKAL (PRISMA) KE SUPABASE 1-KLIK
    if (action === "SYNC_TO_SUPABASE") {
      const users = await prisma.user.findMany();
      const products = await prisma.product.findMany();
      const consignments = await prisma.consignmentItem.findMany();
      const orders = await prisma.order.findMany();

      let syncedUsers = 0;
      let syncedProducts = 0;
      let syncedConsignments = 0;
      let syncedOrders = 0;
      const errors: string[] = [];

      // Sync Users
      for (const u of users) {
        try {
          const { error } = await supabase.from("users").upsert({
            id: u.id,
            name: u.name,
            phone: u.phone || null,
            email: u.email || null,
            city: u.city || "",
            bio: u.bio || "",
            avatar_url: u.avatarUrl || "",
            role: u.role || "USER",
            phone_verified: u.phoneVerified,
            email_verified: u.emailVerified,
            kyc_status: u.kycStatus,
          });
          if (!error) syncedUsers++;
          else errors.push(`User ${u.id}: ${error.message}`);
        } catch (e: any) {
          errors.push(`User ${u.id}: ${e.message}`);
        }
      }

      // Sync Products
      for (const p of products) {
        try {
          let parsedImages: string[] = [];
          try {
            parsedImages = JSON.parse(p.images || "[]");
          } catch {
            parsedImages = p.images ? [p.images] : [];
          }

          const productPayload: any = {
            id: p.id,
            code: p.code,
            slug: p.slug,
            brand: p.brand,
            name: p.name,
            subtitle: p.subtitle,
            category: p.category,
            condition: p.condition,
            usage_duration: p.usageDuration,
            switch_or_variant: p.switchOrVariant,
            completeness: p.completeness,
            description: p.description,
            defect_notes: p.defectNotes,
            price: p.price,
            original_new_price: p.originalNewPrice,
            stock: p.stock,
            location: p.location,
            rating: p.rating,
            sold_count: p.soldCount,
            is_verified_by_team: p.isVerifiedByTeam,
            seller_email: p.sellerEmail || null,
            images: parsedImages,
            status: p.status,
          };

          let { error } = await supabase.from("products").upsert(productPayload);
          if (error && error.message?.includes("seller_email")) {
            delete productPayload.seller_email;
            const retry = await supabase.from("products").upsert(productPayload);
            error = retry.error;
          }

          if (!error) syncedProducts++;
          else errors.push(`Product ${p.code}: ${error.message}`);
        } catch (e: any) {
          errors.push(`Product ${p.code}: ${e.message}`);
        }
      }

      // Sync Consignments
      for (const c of consignments) {
        try {
          let photos: string[] = [];
          try {
            photos = JSON.parse(c.photos || "[]");
          } catch {
            photos = c.photos ? [c.photos] : [];
          }

          const consignmentPayload: any = {
            id: c.id,
            code: c.code,
            seller_id: c.sellerId,
            seller_email: c.sellerEmail || null,
            category: c.category,
            brand_model: c.brandModel,
            variant_spec: c.variantSpec,
            usage_duration: c.usageDuration,
            current_condition: c.currentCondition,
            completeness: c.completeness,
            photos: photos,
            expected_price: c.expectedPrice,
            proposed_price: c.proposedPrice || null,
            consignment_fee: c.consignmentFeeAmount || null,
            estimated_net_payout: c.estimatedNetPayout || null,
            origin_city: c.originCity,
            stage: c.stage,
            badge_label: c.badgeLabel,
            status_summary: c.statusSummary,
          };

          let { error } = await supabase.from("consignments").upsert(consignmentPayload);
          if (error && error.message?.includes("seller_email")) {
            delete consignmentPayload.seller_email;
            const retry = await supabase.from("consignments").upsert(consignmentPayload);
            error = retry.error;
          }

          if (!error) syncedConsignments++;
          else errors.push(`Consignment ${c.code}: ${error.message}`);
        } catch (e: any) {
          errors.push(`Consignment ${c.code}: ${e.message}`);
        }
      }

      // Sync Orders
      for (const o of orders) {
        try {
          const orderPayload: any = {
            id: o.id,
            order_code: o.orderCode,
            buyer_id: o.buyerId,
            buyer_email: o.buyerEmail || null,
            product_id: o.productId,
            item_price: o.itemPrice,
            shipping_courier: o.shippingCourier,
            shipping_cost: o.shippingCost,
            shipping_protection: o.shippingProtection,
            service_fee: o.serviceFee,
            total_amount: o.totalAmount,
            payment_method: o.paymentMethod,
            tracking_number: o.trackingNumber || "",
            escrow_status: o.escrowStatus,
            order_status: o.orderStatus,
          };

          let { error } = await supabase.from("orders").upsert(orderPayload);
          if (error && error.message?.includes("buyer_email")) {
            delete orderPayload.buyer_email;
            const retry = await supabase.from("orders").upsert(orderPayload);
            error = retry.error;
          }

          if (!error) syncedOrders++;
          else errors.push(`Order ${o.orderCode}: ${error.message}`);
        } catch (e: any) {
          errors.push(`Order ${o.orderCode}: ${e.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        synced: {
          users: syncedUsers,
          products: syncedProducts,
          consignments: syncedConsignments,
          orders: syncedOrders,
        },
        errors: errors.slice(0, 5),
        message: `Berhasil sinkronisasi: ${syncedProducts} produk, ${syncedUsers} user, ${syncedConsignments} titipan, ${syncedOrders} pesanan ke Supabase!`,
      });
    }

    // 2. TAYANGKAN BARANG TITIPAN PENJUAL KE KATALOG (PUBLISH TO CATALOG)
    if (action === "PUBLISH_CONSIGNMENT") {
      const { consignmentCode, proposedPrice } = body;
      const consignment = await prisma.consignmentItem.findUnique({
        where: { code: consignmentCode },
      });

      if (!consignment) {
        return NextResponse.json({ error: "Barang titipan tidak ditemukan" }, { status: 404 });
      }

      const numPrice = proposedPrice ? Number(proposedPrice) : consignment.proposedPrice || consignment.expectedPrice;
      const numOriginal = Math.round(numPrice * 1.35);

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const prodCode = `HG-PRD-${randomSuffix}`;
      const slugBase = `${consignment.brandModel.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`.replace(/-+/g, "-");
      const slug = `${slugBase}-${randomSuffix}`;

      let photos: string[] = [];
      try {
        photos = JSON.parse(consignment.photos || "[]");
      } catch {
        photos = consignment.photos ? [consignment.photos] : [];
      }
      if (photos.length === 0) {
        photos = ["https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=900&auto=format&fit=crop"];
      }

      // Buat produk di Prisma
      const newProduct = await prisma.product.create({
        data: {
          code: prodCode,
          slug,
          consignmentItemId: consignment.id,
          sellerId: consignment.sellerId,
          brand: consignment.brandModel.split(" ")[0].toUpperCase(),
          name: consignment.brandModel,
          subtitle: `${consignment.variantSpec || "Varian Standar"} · Sangat baik`,
          category: consignment.category.toUpperCase(),
          condition: "Sangat baik",
          usageDuration: consignment.usageDuration || "6 bulan",
          switchOrVariant: consignment.variantSpec || "Original",
          completeness: consignment.completeness || "Unit lengkap dengan box",
          description: consignment.inspectionFunctionTest || `Gear titip jual terverifikasi Hingo. ${consignment.brandModel}`,
          defectNotes: consignment.inspectionConditionDefect || "Fisik terawat, 100% normal.",
          price: numPrice,
          originalNewPrice: numOriginal,
          stock: 1,
          location: consignment.originCity || "Jakarta Selatan",
          rating: 5.0,
          soldCount: 0,
          isVerifiedByTeam: true,
          images: JSON.stringify(photos),
          status: "AVAILABLE",
        },
      });

      // Update status titipan
      await prisma.consignmentItem.update({
        where: { id: consignment.id },
        data: {
          stage: "PRICE_AGREED_MARKETING",
          badgeLabel: "Sedang dipasarkan",
          statusSummary: `Barang telah lolos inspeksi dan resmi tayang di katalog seharga Rp${numPrice.toLocaleString("id-ID")}`,
        },
      });

      // Dual-write ke Supabase jika tabel ada
      try {
        await supabase.from("products").insert({
          id: newProduct.id,
          code: prodCode,
          slug,
          consignment_item_id: consignment.id,
          seller_id: consignment.sellerId,
          brand: consignment.brandModel.split(" ")[0].toUpperCase(),
          name: consignment.brandModel,
          subtitle: `${consignment.variantSpec || "Varian Standar"} · Sangat baik`,
          category: consignment.category.toUpperCase(),
          condition: "Sangat baik",
          usage_duration: consignment.usageDuration || "6 bulan",
          switch_or_variant: consignment.variantSpec || "Original",
          completeness: consignment.completeness || "Unit lengkap dengan box",
          description: consignment.inspectionFunctionTest || `Gear titip jual terverifikasi Hingo. ${consignment.brandModel}`,
          defect_notes: consignment.inspectionConditionDefect || "Fisik terawat, 100% normal.",
          price: numPrice,
          original_new_price: numOriginal,
          stock: 1,
          location: consignment.originCity || "Jakarta Selatan",
          rating: 5.0,
          sold_count: 0,
          is_verified_by_team: true,
          images: photos,
          status: "AVAILABLE",
        });
      } catch (e) {}

      revalidatePath("/");
      revalidatePath("/catalog");
      revalidatePath("/admin");

      return NextResponse.json({
        success: true,
        product: newProduct,
        message: `Barang "${consignment.brandModel}" resmi ditayangkan ke Katalog Belanja Hingo!`,
      });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. APPROVE / REJECT KYC USER
    if (action === "APPROVE_KYC" || action === "REJECT_KYC") {
      const { userId, status, rejectionReason } = body;
      const targetStatus = action === "REJECT_KYC" ? "REJECTED" : status || "VERIFIED";

      await prisma.$transaction(async (tx) => {
        await tx.kycDocument.update({
          where: { userId },
          data: {
            status: targetStatus,
            rejectionReason: targetStatus === "REJECTED" ? rejectionReason || "Foto kurang jelas / blur" : null,
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { kycStatus: targetStatus },
        });
      });

      try {
        await supabase.from("users").update({ kyc_status: targetStatus }).eq("id", userId);
        await supabase.from("kyc_documents").update({ status: targetStatus }).eq("user_id", userId);
      } catch (e) {}

      return NextResponse.json({ success: true, message: `Status KYC diubah menjadi ${targetStatus}` });
    }

    // 2. CONSIGNMENT STAGES
    if (action === "ONLINE_CHECK_PASS") {
      const { code } = body;
      await prisma.consignmentItem.update({
        where: { code },
        data: {
          stage: "SHIPPING_TO_HINGO",
          badgeLabel: "Kirim barang",
          statusSummary: "Lolos kurasi online. Silakan kirimkan barang ke Gudang Hingo Jakarta Selatan.",
        },
      });

      return NextResponse.json({ success: true, message: `Barang ${code} lolos kurasi online!` });
    }

    if (action === "CONFIRM_WAREHOUSE_RECEIVED") {
      const { code } = body;
      await prisma.consignmentItem.update({
        where: { code },
        data: {
          stage: "INSPECTION_COMPLETED",
          badgeLabel: "Siap inspeksi",
          statusSummary: "Paket telah tiba di Gudang Hingo. Siap dilakukan inspeksi 12 poin teknis.",
        },
      });

      return NextResponse.json({ success: true, message: `Paket ${code} telah diterima di gudang Hingo!` });
    }

    if (action === "SUBMIT_INSPECTION") {
      const {
        code,
        specs,
        functionTest,
        conditionAndDefect,
        completenessReceived,
        proposedPrice,
      } = body;

      const numPrice = Number(proposedPrice);
      const feePercent = 8;
      const feeAmount = Math.round(numPrice * (feePercent / 100));
      const handlingFee = 19000;
      const netPayout = numPrice - feeAmount - handlingFee;

      const updated = await prisma.$transaction(async (tx) => {
        const item = await tx.consignmentItem.update({
          where: { code },
          data: {
            stage: "INSPECTION_COMPLETED",
            badgeLabel: "Menunggu persetujuan harga",
            statusSummary: `Inspeksi fisik tuntas. Usulan harga jual final: Rp${numPrice.toLocaleString("id-ID")}`,
            proposedPrice: numPrice,
            consignmentFeeAmount: feeAmount,
            estimatedNetPayout: netPayout,
            inspectionSpecs: specs,
            inspectionFunctionTest: functionTest,
            inspectionConditionDefect: conditionAndDefect,
            inspectionCompleteness: completenessReceived,
            inspectedAt: new Date(),
          },
        });

        await tx.consignmentTimeline.create({
          data: {
            consignmentId: item.id,
            stepOrder: 5,
            title: "Inspeksi fisik & tes fungsi tuntas",
            description: `Uji fungsi switch & sensor 100% normal. Usulan harga: Rp${numPrice.toLocaleString("id-ID")}.`,
            timestampText: "Oleh Tim Kurator Hingo",
            state: "COMPLETED",
          },
        });

        return item;
      });

      return NextResponse.json({ success: true, consignment: updated });
    }

    // 3. ORDER & ESCROW ACTIONS
    if (action === "VERIFY_ORDER_PAYMENT") {
      const { orderId } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
      });

      if (!ord) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

      await prisma.order.update({
        where: { id: ord.id },
        data: {
          orderStatus: "PAID_PACKING",
          escrowStatus: "HELD_BY_HINGO",
        },
      });

      return NextResponse.json({ success: true, message: "Pembayaran telah diverifikasi lunas!" });
    }

    if (action === "UPDATE_ORDER_TRACKING") {
      const { orderId, trackingNumber, courier = "JNE REG" } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
      });

      if (!ord) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

      await prisma.order.update({
        where: { id: ord.id },
        data: {
          trackingNumber,
          shippingCourier: courier,
          orderStatus: "SHIPPED",
        },
      });

      return NextResponse.json({ success: true, message: `Nomor resi ${trackingNumber} berhasil disimpan!` });
    }

    if (action === "MARK_ORDER_DELIVERED") {
      const { orderId } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
      });

      if (!ord) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

      await prisma.order.update({
        where: { id: ord.id },
        data: {
          orderStatus: "DELIVERED_CHECKING",
        },
      });

      return NextResponse.json({ success: true, message: "Status pesanan diubah ke Paket Tiba (Menunggu konfirmasi pembeli)" });
    }

    if (action === "RELEASE_ESCROW") {
      const { orderId } = body;
      const ord = await prisma.order.findFirst({
        where: { OR: [{ id: orderId }, { orderCode: orderId }] },
        include: { product: true },
      });

      if (!ord) return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });

      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: ord.id },
          data: {
            escrowStatus: "RELEASED_TO_SELLER",
            orderStatus: "COMPLETED",
          },
        });

        const sellerId = ord.product?.sellerId || ord.buyerId;
        await tx.payout.create({
          data: {
            sellerId,
            orderId: ord.id,
            amount: ord.itemPrice - 95000,
            bankName: "BCA",
            accountNumber: "1234567890",
            status: "DISBURSED",
            transferProofUrl: `BCA-HG-${Date.now().toString().slice(-8)}`,
            disbursedAt: new Date(),
          },
        });
      });

      return NextResponse.json({ success: true, message: "Dana escrow berhasil dicairkan ke rekening penjual!" });
    }

    return NextResponse.json({ error: "Aksi tidak dikenali" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
