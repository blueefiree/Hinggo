import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const { paymentProofUrl } = await req.json();

    if (!paymentProofUrl) {
      return NextResponse.json({ error: "URL bukti transfer wajib diisi." }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_proof_url: paymentProofUrl,
        payment_proof_uploaded_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
