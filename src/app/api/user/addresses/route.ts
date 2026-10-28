import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
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

    // If setting as primary, reset other addresses
    if (isPrimary) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
    }

    // Check if this is the user's first address
    const count = await prisma.address.count({ where: { userId: user.id } });
    const shouldBePrimary = isPrimary || count === 0;

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: label || "Rumah",
        recipientName: recipientName.trim(),
        phone: phone.trim(),
        fullAddress: fullAddress.trim(),
        city: city.trim(),
        postalCode: postalCode ? postalCode.trim() : "12810",
        isPrimary: shouldBePrimary,
      },
    });

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

    return NextResponse.json({ success: true, message: "Alamat berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus alamat" }, { status: 500 });
  }
}

