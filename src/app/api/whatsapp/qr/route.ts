import { NextResponse } from "next/server";
import { waState, initializeWhatsApp, isWhatsAppGatewayEnabled } from "@/lib/whatsapp-gateway";

export async function GET() {
  try {
    if (!isWhatsAppGatewayEnabled()) {
      return NextResponse.json({
        isConnected: false,
        qr: null,
        statusMessage: (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV)
          ? "WhatsApp Baileys dinonaktifkan di Vercel (lingkungan serverless read-only)."
          : "WhatsApp Gateway dinonaktifkan (ENABLE_WHATSAPP_GATEWAY belum diset true).",
        isInitializing: false,
      });
    }

    return NextResponse.json({
      isConnected: waState.isConnected,
      qr: waState.qrCodeUrl,
      statusMessage: waState.statusMessage,
      isInitializing: waState.isInitializing,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!isWhatsAppGatewayEnabled()) {
      return NextResponse.json({
        success: false,
        isConnected: false,
        qr: null,
        statusMessage: (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV)
          ? "WhatsApp Baileys dinonaktifkan di Vercel (lingkungan serverless read-only)."
          : "WhatsApp Gateway dinonaktifkan (ENABLE_WHATSAPP_GATEWAY belum diset true).",
      });
    }

    const { action } = await req.json().catch(() => ({ action: "start" }));

    if (action === "disconnect") {
      if (waState.socket) {
        await waState.socket.logout().catch(() => {});
      }
      waState.isConnected = false;
      waState.socket = null;
      waState.qrCodeUrl = null;
      waState.statusMessage = "Sesi WhatsApp diputus";
      return NextResponse.json({ success: true, isConnected: false });
    }

    // Start or get QR
    const result = await initializeWhatsApp();
    return NextResponse.json({
      success: true,
      isConnected: result.isConnected,
      qr: result.qr,
      statusMessage: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

