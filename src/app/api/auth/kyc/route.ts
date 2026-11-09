import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Silakan masuk terlebih dahulu" }, { status: 401 });
    }

    const { fullNameKtp, nikNumber, ktpFileName, selfieFileName } = await req.json();

    if (!fullNameKtp || !nikNumber) {
      return NextResponse.json({ error: "Nama lengkap dan 16 digit NIK wajib diisi" }, { status: 400 });
    }

    const cleanNik = nikNumber.replace(/\D/g, "");
    if (cleanNik.length !== 16) {
      return NextResponse.json({ error: "NIK harus berjumlah tepat 16 angka" }, { status: 400 });
    }

    const maskedNik = `•••• •••• •••• ${cleanNik.slice(-4)}`;

    const userEmailNorm = user.email?.trim()?.toLowerCase();

    // Upsert KycDocument
    const kycDoc = await prisma.kycDocument.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        userEmail: userEmailNorm,
        fullNameKtp: fullNameKtp.trim(),
        nikNumber: cleanNik,
        maskedNik,
        ktpImageUrl: ktpFileName || "/uploads/kyc/ktp_uploaded.jpg",
        ktpFileSize: "1.8 MB",
        selfieImageUrl: selfieFileName || "/uploads/kyc/selfie_uploaded.jpg",
        selfieFileSize: "2.1 MB",
        status: "PENDING_REVIEW",
      },
      update: {
        userEmail: userEmailNorm,
        fullNameKtp: fullNameKtp.trim(),
        nikNumber: cleanNik,
        maskedNik,
        ktpImageUrl: ktpFileName || "/uploads/kyc/ktp_uploaded.jpg",
        selfieImageUrl: selfieFileName || "/uploads/kyc/selfie_uploaded.jpg",
        status: "PENDING_REVIEW",
        rejectionReason: null,
      },
    });

    // Update User
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: fullNameKtp.trim(),
        kycStatus: "PENDING_REVIEW",
      },
      include: {
        kycDocument: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      kycDocument: kycDoc,
      message: "Data identitas berhasil dikirim untuk peninjauan tim kurator Hingo.",
    });
  } catch (error: any) {
    console.error("KYC submission error:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan data KYC" }, { status: 500 });
  }
}
