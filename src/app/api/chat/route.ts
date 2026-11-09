import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ thread: null, messages: [], threads: [] });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // CS_SUPPORT or PRODUCT_ADMIN
    const productId = searchParams.get("productId");
    const threadId = searchParams.get("threadId");

    const userEmailNorm = user.email?.trim()?.toLowerCase();
    // Fetch all threads for current user
    const userThreads = await prisma.chatThread.findMany({
      where: {
        OR: [
          ...(userEmailNorm ? [{ userEmail: userEmailNorm }] : []),
          { userId: user.id },
        ],
      },
      include: {
        messages: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    let activeThread = null;

    if (threadId) {
      activeThread = userThreads.find((t) => t.id === threadId) || null;
    } else if (productId) {
      activeThread =
        userThreads.find((t) => t.relatedProductId === productId) || null;
    } else if (type) {
      activeThread = userThreads.find((t) => t.type === type) || null;
    } else if (userThreads.length > 0) {
      activeThread = userThreads[0];
    }

    return NextResponse.json({
      threads: userThreads,
      thread: activeThread,
      messages: activeThread ? activeThread.messages : [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu untuk memulai percakapan" },
        { status: 401 }
      );
    }

    const {
      threadId,
      productId,
      orderId,
      type = "PRODUCT_ADMIN",
      content,
    } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Pesan tidak boleh kosong" },
        { status: 400 }
      );
    }

    // 1. Find or create thread
    let thread = null;
    if (threadId) {
      thread = await prisma.chatThread.findUnique({
        where: { id: threadId },
        include: { messages: true },
      });
    }

    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        product = await prisma.product.findFirst({
          where: { slug: productId },
        });
      }
    }

    if (!thread) {
      if (productId && product) {
        thread = await prisma.chatThread.findFirst({
          where: { userId: user.id, relatedProductId: product.id },
          include: { messages: true },
        });
      } else if (type === "CS_SUPPORT") {
        thread = await prisma.chatThread.findFirst({
          where: { userId: user.id, type: "CS_SUPPORT" },
          include: { messages: true },
        });
      }
    }

    if (!thread) {
      const title = product
        ? product.name
        : type === "CS_SUPPORT"
        ? "Pusat Bantuan & CS Hingo"
        : "Tanya Tim Inspeksi Hingo";

      const agentName =
        type === "CS_SUPPORT" ? "Mira · CS Hingo" : "Admin Hingo";

      thread = await prisma.chatThread.create({
        data: {
          userId: user.id,
          userEmail: user.email?.trim()?.toLowerCase() || null,
          type,
          title,
          agentName,
          ticketCode: `CS-${Math.floor(1000 + Math.random() * 9000)}`,
          relatedProductId: product ? product.id : null,
          relatedOrderId: orderId || null,
        },
        include: { messages: true },
      });
    }

    const timeLabel = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // 2. Save User Message
    const userMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        senderId: user.id,
        senderRole: "USER",
        senderName: user.name,
        content: content.trim(),
        timeLabel,
        isRead: true,
      },
    });

    // 3. Smart Auto-Reply logic
    let replyContent = "";
    const lowerContent = content.toLowerCase();

    if (type === "PRODUCT_ADMIN" && product) {
      const priceFormatted = new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(product.price);

      if (
        lowerContent.includes("tersedia") ||
        lowerContent.includes("stok") ||
        lowerContent.includes("ready") ||
        lowerContent.includes("masih")
      ) {
        replyContent = `Halo Kak! Ya, unit ${product.name} (${priceFormatted}) ini masih tersedia di gudang Hingo ${product.location}. Karena setiap gear preloved stoknya hanya 1 unit dan sudah lolos 12 poin inspeksi fungsi, silakan langsung checkout agar tidak keduluan pembeli lain ya kak.`;
      } else if (
        lowerContent.includes("tombol") ||
        lowerContent.includes("fungsi") ||
        lowerContent.includes("normal") ||
        lowerContent.includes("minus") ||
        lowerContent.includes("cacat") ||
        lowerContent.includes("lecet")
      ) {
        replyContent = `Kondisi unit tercatat ${product.condition}. Hasil inspeksi tim kurator kami: ${
          product.defectNotes ||
          "Semua tombol, switch/sensor, dan konektivitas berfungsi 100% prima dan normal tanpa kendala."
        }`;
      } else if (
        lowerContent.includes("lengkap") ||
        lowerContent.includes("box") ||
        lowerContent.includes("dus") ||
        lowerContent.includes("kabel") ||
        lowerContent.includes("kelengkapan")
      ) {
        replyContent = `Untuk kelengkapannya: ${product.completeness}. Unit sudah dicek steril dan dikemas aman dengan bubble wrap tebal di gudang Hingo.`;
      } else if (
        lowerContent.includes("kirim") ||
        lowerContent.includes("hari ini") ||
        lowerContent.includes("kurir") ||
        lowerContent.includes("kapan") ||
        lowerContent.includes("sampai")
      ) {
        replyContent = `Bisa langsung dikirim hari ini kak! Untuk pesanan yang checkout sebelum pukul 15.00 WIB, paket langsung diproses tim gudang dan diserahkan ke kurir di hari yang sama.`;
      } else {
        replyContent = `Terima kasih sudah bertanya mengenai ${product.name}! Tim inspeksi Hingo siap membantu. Unit ini tersimpan aman di gudang Hingo ${product.location} dan dilindungi garansi cek fisik 48 jam dengan escrow rekening bersama saat paket tiba.`;
      }
    } else if (type === "CS_SUPPORT") {
      if (
        lowerContent.includes("pesanan") ||
        lowerContent.includes("resi") ||
        lowerContent.includes("lacak") ||
        lowerContent.includes("status")
      ) {
        replyContent = `Halo Kak ${user.name}! Pelacakan pesanan dan status kurir ter-update otomatis pada menu Transaksi. Dana belanjaan kakak tetap ditahan aman di Rekening Bersama Hingo sampai barang tiba dan selesai dicek selama 48 jam.`;
      } else if (
        lowerContent.includes("titip") ||
        lowerContent.includes("jual") ||
        lowerContent.includes("biaya") ||
        lowerContent.includes("komisi")
      ) {
        replyContent = `Halo Kak! Layanan konsinyasi Hingo mengenakan biaya flat 8% setelah gear berhasil laku terjual. Kami bantu kurasi foto online, cek fisik di gudang, foto katalog studio, hingga packing ke pembeli.`;
      } else {
        replyContent = `Halo Kak ${user.name}! CS Mira siap membantu kendala belanja atau pengajuan titip jualmu. Silakan sampaikan pertanyaanmu, kami siap mendampingi.`;
      }
    } else {
      replyContent = `Pesanmu telah kami terima. Tim Hingo akan segera membalas pertanyaanmu.`;
    }

    // 4. Save Auto-Reply Message to Database
    const autoReplyMessage = await prisma.chatMessage.create({
      data: {
        threadId: thread.id,
        senderRole: type === "CS_SUPPORT" ? "CS" : "ADMIN",
        senderName: type === "CS_SUPPORT" ? "Mira · CS Hingo" : "Admin Hingo",
        content: replyContent,
        timeLabel,
        isRead: true,
      },
    });

    // Touch thread updatedAt
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { updatedAt: new Date() },
    });

    // Sinkronkan ke Supabase public.chat_messages
    try {
      await supabase.from("chat_messages").insert([
        {
          thread_id: thread.id,
          sender_role: "USER",
          content: content.trim(),
          is_read: true,
        },
        {
          thread_id: thread.id,
          sender_role: type === "CS_SUPPORT" ? "CS" : "ADMIN",
          content: replyContent,
          is_read: true,
        },
      ]);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      threadId: thread.id,
      userMessage,
      autoReply: autoReplyMessage,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
