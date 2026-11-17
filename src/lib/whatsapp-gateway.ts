import QRCode from "qrcode";
import { normalizePhoneNumber } from "./otp-sender";

// In-memory singleton state for WhatsApp Gateway
interface WhatsAppState {
  socket: any | null;
  qrCodeUrl: string | null;
  rawQr: string | null;
  isConnected: boolean;
  isInitializing: boolean;
  statusMessage: string;
}

const globalForWhatsApp = globalThis as unknown as {
  waState?: WhatsAppState;
};

export const waState: WhatsAppState = globalForWhatsApp.waState || {
  socket: null,
  qrCodeUrl: null,
  rawQr: null,
  isConnected: false,
  isInitializing: false,
  statusMessage: "WhatsApp gateway belum diinisialisasi",
};

globalForWhatsApp.waState = waState;

/**
 * Validasi apakah WhatsApp Gateway (Baileys) diizinkan berjalan:
 * - DILARANG berjalan di Vercel (serverless read-only filesystem)
 * - DILARANG menulis ke disk di produksi
 * - Hanya aktif jika variabel khusus ENABLE_WHATSAPP_GATEWAY === "true" dan bukan di Vercel
 */
export function isWhatsAppGatewayEnabled(): boolean {
  if (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV) {
    return false;
  }
  return process.env.ENABLE_WHATSAPP_GATEWAY === "true";
}

/**
 * Initializes Baileys WhatsApp Web QR Connection
 */
export async function initializeWhatsApp(): Promise<{ qr: string | null; isConnected: boolean; message: string }> {
  if (!isWhatsAppGatewayEnabled()) {
    const disabledReason = (process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV)
      ? "WhatsApp Baileys dinonaktifkan di Vercel (lingkungan serverless read-only)."
      : "WhatsApp Gateway dinonaktifkan (ENABLE_WHATSAPP_GATEWAY belum diset true).";
    return {
      qr: null,
      isConnected: false,
      message: disabledReason,
    };
  }

  if (waState.isConnected && waState.socket) {
    return { qr: null, isConnected: true, message: "WhatsApp sudah terhubung" };
  }

  if (waState.isInitializing) {
    return {
      qr: waState.qrCodeUrl,
      isConnected: waState.isConnected,
      message: waState.statusMessage,
    };
  }

  waState.isInitializing = true;
  waState.statusMessage = "Menyiapkan sesi WhatsApp Web...";

  try {
    // Dynamic import to prevent SSR bundling issues
    const { default: makeWASocket, DisconnectReason, useMultiFileAuthState } = await import("@whiskeysockets/baileys");
    const pino = (await import("pino")).default;

    const { state, saveCreds } = await useMultiFileAuthState("./wa_auth_session");

    const sock = makeWASocket({
      auth: state,
      logger: pino({ level: "silent" }) as any,
      browser: ["Hingo Platform", "Chrome", "1.0.0"],
      printQRInTerminal: false,
    });

    waState.socket = sock;

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        waState.rawQr = qr;
        try {
          waState.qrCodeUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 6 });
          waState.statusMessage = "Silakan scan QR Code dengan WhatsApp di ponsel Anda";
        } catch (qrErr) {
          console.error("Gagal generate QR Code data URL:", qrErr);
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        waState.isConnected = false;
        waState.socket = null;
        waState.isInitializing = false;
        waState.statusMessage = shouldReconnect ? "Koneksi terputus. Mencoba menghubungkan kembali..." : "Sesi WhatsApp logout.";
        if (shouldReconnect) {
          setTimeout(() => initializeWhatsApp(), 3000);
        }
      } else if (connection === "open") {
        waState.isConnected = true;
        waState.isInitializing = false;
        waState.qrCodeUrl = null;
        waState.rawQr = null;
        waState.statusMessage = "WhatsApp Web Hingo berhasil terhubung!";
        console.log("✓ [BAILEYS] WhatsApp Web Hingo berhasil terhubung dan siap kirim OTP!");
      }
    });

    return {
      qr: waState.qrCodeUrl,
      isConnected: waState.isConnected,
      message: waState.statusMessage,
    };
  } catch (err: any) {
    console.error("Gagal inisialisasi Baileys WhatsApp:", err.message);
    waState.isInitializing = false;
    waState.statusMessage = `Error: ${err.message}`;
    return {
      qr: null,
      isConnected: false,
      message: err.message,
    };
  }
}

/**
 * Dispatch real WhatsApp OTP via Baileys OR Fonnte API
 */
export async function dispatchWhatsAppOtp(rawPhone: string, otpCode: string): Promise<{ delivered: boolean; channel: string; info: string }> {
  const normalized = normalizePhoneNumber(rawPhone);
  const message = `Halo! Kode OTP Hingo kamu adalah: *${otpCode}*.\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku sebagai Hingo.`;

  // 1. Coba kirim via Baileys WhatsApp Web QR jika diizinkan dan sudah terhubung
  if (isWhatsAppGatewayEnabled() && waState.isConnected && waState.socket) {
    try {
      const jid = `${normalized}@s.whatsapp.net`;
      await waState.socket.sendMessage(jid, { text: message });
      console.log(`✓ [BAILEYS] Pesan OTP sukses dikirim ke ${normalized}`);
      return { delivered: true, channel: "BAILEYS_WHATSAPP_WEB", info: "Terkirim langsung via WhatsApp Web HP Anda" };
    } catch (baileysErr: any) {
      console.warn("Pengiriman via Baileys gagal, mencoba fallback Fonnte...", baileysErr.message);
    }
  }

  // 2. Coba kirim via Fonnte API jika FONNTE_TOKEN tersedia
  const fonnteToken = process.env.FONNTE_TOKEN;
  if (fonnteToken && fonnteToken.trim() !== "" && !fonnteToken.includes("PASTE_TOKEN")) {
    try {
      const formData = new URLSearchParams();
      formData.append("target", normalized);
      formData.append("message", message);
      formData.append("countryCode", "62");

      const res = await fetch("https://api.fonnte.com/send", {
        method: "POST",
        headers: { Authorization: fonnteToken },
        body: formData,
      });

      const fonnteData = await res.json();
      if (fonnteData.status) {
        console.log(`✓ [FONNTE] WhatsApp OTP sukses dikirim ke ${normalized}`);
        return { delivered: true, channel: "FONNTE_API", info: "Terkirim via Fonnte WhatsApp Gateway" };
      }
    } catch (fonnteErr: any) {
      console.warn("Pengiriman via Fonnte gagal:", fonnteErr.message);
    }
  }

  // 3. Fallback Dev Mode Simulation
  console.log(`\n==================================================`);
  console.log(`[WHATSAPP OTP NOTICE - READY TO CONNECT]`);
  console.log(`Nomor Tujuan : ${rawPhone} -> ${normalized}`);
  console.log(`Kode OTP     : ${otpCode}`);
  console.log(`Tips: Klik 'Tautkan Pengirim WhatsApp' di halaman login untuk scan QR WhatsApp Anda!`);
  console.log(`==================================================\n`);

  return {
    delivered: false,
    channel: "SIMULATED",
    info: "Gateway belum di-scan QR / FONNTE_TOKEN belum diisi",
  };
}

