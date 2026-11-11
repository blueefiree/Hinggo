import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const {
      productId,
      addressId,
      shippingCourier = "JNE REG",
      shippingCost = 18000,
      paymentMethod = "BCA_VA",
      buyerNote = "",
    } = await req.json();

    // 1. Fetch product - Supabase adalah Single Source of Truth
    let targetProductId = productId;
    if (!targetProductId) {
      const { data: firstCart } = await supabase
        .from("cart_items")
        .select("product_id")
        .eq("user_id", user.id)
        .limit(1);
      targetProductId = firstCart && firstCart[0] ? firstCart[0].product_id : null;
    }

    if (!targetProductId) {
      return NextResponse.json({ error: "Pilih produk yang ingin di-checkout" }, { status: 400 });
    }

    // Ambil data produk langsung dari Supabase
    const { data: product, error: prodErr } = await supabase
      .from("products")
      .select("*")
      .eq("id", targetProductId)
      .single();

    if (prodErr || !product) {
      return NextResponse.json({ error: "Produk tidak ditemukan di katalog" }, { status: 404 });
    }

    if (product.stock <= 0 || product.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "Gear sudah terjual atau tidak tersedia" },
        { status: 400 }
      );
    }

    // 2. Fetch or create default address in Supabase
    let address: any = null;
    if (addressId) {
      const { data: addr } = await supabase
        .from("addresses")
        .select("*")
        .eq("id", addressId)
        .single();
      address = addr;
    }

    if (!address) {
      const { data: addrs } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_primary", true)
        .limit(1);
      address = addrs && addrs[0] ? addrs[0] : null;
    }

    if (!address) {
      const { data: addrs } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);
      address = addrs && addrs[0] ? addrs[0] : null;
    }

    if (!address) {
      const newAddrId = `addr-${Date.now()}`;
      const { data: createdAddr } = await supabase
        .from("addresses")
        .insert({
          id: newAddrId,
          user_id: user.id,
          label: "Rumah",
          recipient_name: user.name || "Pembeli Hingo",
          phone: user.phone || "081234567890",
          full_address: "Jl. Sudirman No. 45, Kebayoran Baru, Jakarta Selatan",
          city: "Jakarta Selatan",
          postal_code: "12190",
          is_primary: true,
        })
        .select()
        .single();
      address = createdAddr || { id: newAddrId };
    }

    const itemPrice = Number(product.price);
    const shippingProtection = 5000;
    const serviceFee = 2500;
    const totalAmount = itemPrice + Number(shippingCost) + shippingProtection + serviceFee;

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    const orderCode = `GRL-${dateStr}-${randomSuffix}`;
    const orderId = `ord-${dateStr}-${randomSuffix}`;
    const vaNumber = `8801 ${(user.phone || "081234567890").replace(/\D/g, "").slice(-8)}`;
    const trackingNumber = `JNE${dateStr.slice(2)}${randomSuffix}`;

    // 3. Simpan Pesanan ke Supabase
    const { data: newOrder, error: orderErr } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        order_code: orderCode,
        buyer_id: user.id,
        product_id: product.id,
        address_id: address?.id || null,
        item_price: itemPrice,
        shipping_courier: shippingCourier,
        shipping_cost: Number(shippingCost),
        shipping_protection: shippingProtection,
        service_fee: serviceFee,
        total_amount: totalAmount,
        payment_method: paymentMethod,
        va_number: vaNumber,
        buyer_note: buyerNote || "",
        tracking_number: trackingNumber,
        escrow_status: "WAITING_PAYMENT",
        order_status: "WAITING_PAYMENT",
        inspection_deadline: "48 jam setelah paket tiba",
      })
      .select()
      .single();

    if (orderErr) {
      console.error("Gagal menyimpan pesanan ke Supabase:", orderErr);
      return NextResponse.json(
        { error: `Gagal membuat pesanan di database: ${orderErr.message}` },
        { status: 500 }
      );
    }

    // 4. Update status produk menjadi SOLD di Supabase
    await supabase
      .from("products")
      .update({ stock: 0, status: "SOLD" })
      .eq("id", product.id);

    // 5. Bersihkan item keranjang di Supabase
    await supabase
      .from("cart_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", product.id);

    // Best-effort sinkronisasi ke Prisma lokal untuk testing offline
    try {
      await prisma.product.upsert({
        where: { id: product.id },
        update: { stock: 0, status: "SOLD" },
        create: {
          id: product.id,
          code: product.code || `PRD-${randomSuffix}`,
          slug: product.slug || `prod-${product.id}`,
          name: product.name,
          subtitle: product.subtitle || "",
          brand: product.brand,
          category: product.category,
          price: itemPrice,
          originalNewPrice: Number(product.original_new_price || product.price),
          condition: product.condition || "Bekas",
          usageDuration: product.usage_duration || "Pemakaian normal",
          switchOrVariant: product.switch_or_variant || "",
          location: product.location || "Jakarta Selatan",
          images: typeof product.images === "string" ? product.images : JSON.stringify(product.images || []),
          rating: Number(product.rating || 5.0),
          soldCount: Number(product.sold_count || 0),
          stock: 0,
          status: "SOLD",
          description: product.description || "",
          defectNotes: product.defect_notes || "",
          completeness: product.completeness || "",
        },
      });

      await prisma.order.create({
        data: {
          id: newOrder.id,
          orderCode: newOrder.order_code,
          buyerId: user.id,
          buyerEmail: user.email?.trim()?.toLowerCase() || null,
          productId: product.id,
          addressId: address?.id || `addr-${randomSuffix}`,
          itemPrice,
          shippingCourier,
          shippingCost: Number(shippingCost),
          shippingProtection,
          serviceFee,
          totalAmount,
          paymentMethod,
          vaNumber,
          buyerNote,
          trackingNumber,
          escrowStatus: "WAITING_PAYMENT",
          orderStatus: "WAITING_PAYMENT",
          inspectionDeadline: "48 jam setelah paket tiba",
        },
      });
    } catch (e) {
      // Abaikan jika prisma lokal gagal, Supabase tetap sukses
    }

    return NextResponse.json({
      success: true,
      orderCode: newOrder.order_code,
      orderId: newOrder.id,
      redirectTo: `/checkout/payment/${newOrder.order_code}?method=${paymentMethod.toLowerCase()}`,
    });
  } catch (error: any) {
    console.error("Checkout transaction error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat pesanan" }, { status: 500 });
  }
}

