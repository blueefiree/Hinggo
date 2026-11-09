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
    const bankAccounts = await prisma.bankAccount.findMany({
      where: {
        OR: [
          ...(userEmailNorm ? [{ userEmail: userEmailNorm }] : []),
          { userId: user.id },
        ],
      },
      orderBy: [{ isPrimary: "desc" }, { id: "desc" }],
    });

    return NextResponse.json({ bankAccounts });
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

    const { bankName, accountNumber, accountHolder, isPrimary } = await req.json();

    if (!bankName || !accountNumber || !accountHolder) {
      return NextResponse.json({ error: "Nama bank, nomor rekening, dan nama pemilik wajib diisi" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      try {
        await supabase.from("bank_accounts").update({ is_primary: false }).eq("user_id", user.id);
      } catch (e) {}
    }

    const count = await prisma.bankAccount.count({ where: { userId: user.id } });
    const shouldBePrimary = isPrimary || count === 0;

    const userEmailNorm = user.email?.trim()?.toLowerCase();
    const bankAccount = await prisma.bankAccount.create({
      data: {
        userId: user.id,
        userEmail: userEmailNorm,
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountHolder: accountHolder.trim(),
        isPrimary: shouldBePrimary,
      },
    });

    // Sinkronkan ke Supabase public.bank_accounts
    try {
      await supabase.from("bank_accounts").insert({
        user_id: user.id,
        user_email: userEmailNorm,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_holder: accountHolder.trim(),
        is_primary: shouldBePrimary,
      });
    } catch (e) {}

    return NextResponse.json({ success: true, bankAccount });
  } catch (error: any) {
    console.error("Error creating bank account:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan rekening bank" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isPrimary, bankName, accountNumber, accountHolder } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID rekening bank wajib disertakan" }, { status: 400 });
    }

    if (isPrimary) {
      await prisma.bankAccount.updateMany({
        where: { userId: user.id },
        data: { isPrimary: false },
      });
      try {
        await supabase.from("bank_accounts").update({ is_primary: false }).eq("user_id", user.id);
      } catch (e) {}
    }

    const bankAccount = await prisma.bankAccount.update({
      where: { id, userId: user.id },
      data: {
        ...(bankName ? { bankName: bankName.trim() } : {}),
        ...(accountNumber ? { accountNumber: accountNumber.trim() } : {}),
        ...(accountHolder ? { accountHolder: accountHolder.trim() } : {}),
        ...(isPrimary !== undefined ? { isPrimary } : {}),
      },
    });

    return NextResponse.json({ success: true, bankAccount });
  } catch (error: any) {
    console.error("Error updating bank account:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui rekening" }, { status: 500 });
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
      return NextResponse.json({ error: "ID rekening diperlukan" }, { status: 400 });
    }

    await prisma.bankAccount.delete({
      where: { id, userId: user.id },
    });

    try {
      await supabase.from("bank_accounts").delete().eq("id", id);
    } catch (e) {}

    return NextResponse.json({ success: true, message: "Rekening berhasil dihapus" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus rekening" }, { status: 500 });
  }
}
