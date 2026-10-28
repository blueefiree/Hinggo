import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, city, bio, avatarUrl } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(city !== undefined ? { city: city.trim() } : {}),
        ...(bio !== undefined ? { bio: bio.trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl.trim() } : {}),
      },
      include: {
        kycDocument: true,
        addresses: true,
        bankAccounts: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui profil" }, { status: 500 });
  }
}

