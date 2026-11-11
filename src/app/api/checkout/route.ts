import { NextResponse } from "next/server";
import { getCurrentUser, ensurePrismaUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    await ensurePrismaUser(user);

    const {
      productId,
      addressId,
      shippingCourier = "JNE REG",
      shippingCost = 18000,
      paymentMethod = "BCA_VA",
      buyerNote = "",
    } = await req.json();

    // 1. Fetch product
    let targetProductId = productId;
    if (!targetProductId) {
      const firstCart = await prisma.cartItem.findFirst({
        where: { userId: user.id },
      });
      targetProductId = firstCart?.productId;
    }

    if (!targetProductId) {
      return NextResponse.json({ error: "Pilih produk yang ingin di-checkout" }, { status: 400 });
    }

    let product = await prisma.product.findUnique({
      where: { id: targetProductId },
    });

    // Supabase fallback if not found in local prisma
    if (!product) {
      try {
        const { data: sbProduct } = await supabase
          .from("products")
          .select("*")
          .eq("id", targetProductId)
          .single();

        if (sbProduct) {
          product = await prisma.product.upsert({
            where: { id: sbProduct.id },
            update: {},
            create: {
              id: sbProduct.id,
              code: sbProduct.code || `PRD-${Date.now().toString().slice(-6)}`,
              slug: sbProduct.slug || `prod-${Date.now()}`,
              name: sbProduct.name,
              subtitle: sbProduct.subtitle || "",
              brand: sbProduct.brand,
              category: sbProduct.category,
              price: Number(sbProduct.price),
              originalNewPrice: Number(sbProduct.original_price || sbProduct.original_new_price || sbProduct.price),
              condition: sbProduct.condition || "Bekas",
              usageDuration: sbProduct.usage_duration || "Pemakaian normal",
              switchOrVariant: sbProduct.switch_or_variant || "",
              location: sbProduct.location || "Jakarta Selatan",
              images: typeof sbProduct.images === "string" ? sbProduct.images : JSON.stringify(sbProduct.images || []),
              rating: Number(sbProduct.rating || 5.0),
              soldCount: Number(sbProduct.sold_count || 0),
              stock: Number(sbProduct.stock || 1),
              status: sbProduct.status || "AVAILABLE",
              description: sbProduct.description || "",
              defectNotes: sbProduct.defect_notes || "",
              completeness: sbProduct.completeness || "",
            },
          });
        }
      } catch (sbErr) {
        console.warn("Supabase checkout product fallback error:", sbErr);
      }
    }

    if (!product || product.stock <= 0 || product.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Gear sudah terjual atau tidak tersedia" },
        { status: 400 }
      );
    }

    // 2. Fetch or create default address for the user
    let address = addressId
      ? await prisma.address.findUnique({ where: { id: addressId } })
      : await prisma.address.findFirst({ where: { userId: user.id, isPrimary: true } });

    if (!address) {
      address = await prisma.address.findFirst({ where: { userId: user.id } });
    }

    const userEmailNorm = user.email?.trim()?.toLowerCase() || null;

    if (!address) {
      address = await prisma.address.create({
        data: {
          userId: user.id,
          userEmail: userEmailNorm,
          label: "Rumah",
          recipientName: user.name,
          phone: user.phone || "081234567890",
          fullAddress: "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan",
          city: "Jakarta Selatan",
          postalCode: "12190",
          isPrimary: true,
        },
      });
    }

    const shippingProtection = 5000;
    const serviceFee = 2500;
    const totalAmount = product.price + shippingCost + shippingProtection + serviceFee;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderCode = `GRL-${dateStr}-${randomSuffix}`;
    const vaNumber = `8801 ${(user.phone || "081234567890").replace(/\D/g, "").slice(-8)}`;

    // 3. Database transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create order
      const ord = await tx.order.create({
        data: {
          orderCode,
          buyerId: user.id,
          buyerEmail: userEmailNorm,
          productId: product.id,
          addressId: address.id,
          itemPrice: product.price,
          shippingCourier,
          shippingCost,
          shippingProtection,
          serviceFee,
          totalAmount,
          paymentMethod,
          vaNumber,
          buyerNote,
          trackingNumber: `JNE${dateStr.slice(2)}${randomSuffix}`,
          escrowStatus: "WAITING_PAYMENT",
          orderStatus: "WAITING_PAYMENT",
          inspectionDeadline: "48 jam setelah paket tiba",
        },
      });

      // Add timeline steps
      await tx.orderTimeline.createMany({
        data: [
          {
            orderId: ord.id,
            stepOrder: 1,
            title: "Menunggu pembayaran pembeli",
            description: `Menunggu transfer ${paymentMethod === "QRIS" ? "QRIS" : "BCA Virtual Account"} sebesar Rp${totalAmount.toLocaleString("id-ID")}.`,
            timestampText: "Menunggu pembayaran",
            isCompleted: false,
          },
          {
            orderId: ord.id,
            stepOrder: 2,
            title: "Pengemasan aman & pengiriman Hingo",
            description: "Gudang Hingo Jakarta Selatan.",
            timestampText: "Menunggu pembayaran",
            isCompleted: false,
          },
          {
            orderId: ord.id,
            stepOrder: 3,
            title: "Paket tiba — masa uji 48 jam",
            description: "Uji fungsi tombol, switch, sensor, dan kelengkapan sebelum konfirmasi.",
            timestampText: "Belum dimulai",
            isCompleted: false,
          },
          {
            orderId: ord.id,
            stepOrder: 4,
            title: "Konfirmasi & pencairan dana",
            description: "Setelah dikonfirmasi sesuai, dana escrow diteruskan ke pemilik gear.",
            timestampText: "Menunggu konfirmasi pembeli",
            isCompleted: false,
          },
        ],
      });

      // Update product stock to 0 and SOLD
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: 0,
          status: "SOLD",
        },
      });

      // Clear from user cart
      await tx.cartItem.deleteMany({
        where: {
          userId: user.id,
          productId: product.id,
        },
      });

      return ord;
    });

    return NextResponse.json({
      success: true,
      orderCode: newOrder.orderCode,
      orderId: newOrder.id,
      redirectTo: `/checkout/payment/${newOrder.orderCode}?method=${paymentMethod.toLowerCase()}`,
    });
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat pesanan" }, { status: 500 });
  }
}
