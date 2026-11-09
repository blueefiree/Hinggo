import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const addresses = await prisma.address.findMany({
      where: {
        OR: [
          ...(userEmailNorm ? [{ userEmail: userEmailNorm }] : []),
          { userId: user.id },
        ],
      },
      orderBy: [{ isPrimary: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { label, recipientName, phone, fullAddress, city, postalCode, isPrimary } = await req.json();

    if (!recipientName || !phone || !fullAddress || !city) {
      return NextResponse.json({ error: "Nama penerima, no. HP, alamat lengkap, dan kota wajib diisi" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      try {
        await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
      } catch (e) {}
    }

    const count = await prisma.address.count({ where: { userId: user.id } });
    const shouldBePrimary = isPrimary || count === 0;

    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const address = await prisma.address.create({
      data: {
        userId: user.id,
        userEmail: userEmailNorm,
        label: label || "Rumah",
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        fullAddress: fullAddress.trim(),
        city: city.trim(),
        postalCode: postalCode ? postalCode.trim() : "12810",
        isPrimary: shouldBePrimary,
      },
    });

    // Sinkronkan ke Supabase public.addresses
    try {
      await supabase.from("addresses").insert({
        user_id: user.id,
        user_email: userEmailNorm,
        label: label || "Rumah",
        recipient_name: recipientName.trim(),
        phone: phone.trim(),
        full_address: fullAddress.trim(),
        city: city.trim(),
        postal_code: postalCode ? postalCode.trim() : "12810",
        is_primary: shouldBePrimary,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("Error creating address:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan alamat" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, label, recipientName, phone, fullAddress, city, postalCode, isPrimary } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID alamat wajib disertakan" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      try {
        await supabase.from("addresses").update({ is_primary: false }).eq("user_id", user.id);
      } catch (e) {}
    }

    const address = await prisma.address.update({
      where: { id, userId: user.id },
      data: {
        ...(label ? { label: label.trim() } : {}),
        ...(recipientName ? { recipientName: recipientName.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(fullAddress ? { fullAddress: fullAddress.trim() } : {}),
        ...(city ? { city: city.trim() } : {}),
        ...(postalCode ? { postalCode: postalCode.trim() } : {}),
        ...(isPrimary !== undefined ? { isPrimary } : {}),
      },
    });

    return NextResponse.json({ success: true, address });
  } catch (error: any) {
    console.error("Error updating address:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui alamat" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID alamat diperlukan" }, { status: 400 });
    }

    await prisma.address.delete({
      where: { id, userId: user.id },
    });

    try {
      await supabase.from("addresses").delete().eq("id", id);
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Alamat berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus alamat" }, { status: 500 });
  }
}
