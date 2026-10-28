import nodemailer from "nodemailer";

export function normalizePhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (cleaned.startsWith("8")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

export async function sendOtpEmail(email: string, otpCode: string): Promise<{ delivered: boolean; info?: string }> {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || `"Hingo Official" <${user || "support@hingo.id"}>`;

  // Check if SMTP is configured
  if (!user || !pass || pass.trim() === "" || pass.includes("xxxx")) {
    console.log(`\n==================================================`);
    console.log(`[DEV NOTICE - EMAIL OTP SIMULATED]`);
    console.log(`Tujuan Email : ${email}`);
    console.log(`Kode OTP 6-Digit: ${otpCode}`);
    console.log(`(Isi SMTP_USER & SMTP_PASS di .env untuk pengiriman asli)`);
    console.log(`==================================================\n`);
    return { delivered: false, info: "Dev simulation (SMTP credentials not set)" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #FAFAF9; border-radius: 20px; border: 1px solid #E5E5E5;">
        <div style="background-color: #FFC629; padding: 20px 24px; border-radius: 14px; text-align: center; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #1A1A1A;">HINGO</h1>
          <p style="margin: 4px 0 0 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #1A1A1A;">Platform Kurasi Gear Gaming & Setup</p>
        </div>
        
        <div style="background-color: #FFFFFF; padding: 28px; border-radius: 16px; border: 1px solid #EEEEEE; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 800; color: #1A1A1A;">Kode Verifikasi Masuk Akun</h2>
          <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 1.5; color: #666666;">
            Gunakan kode OTP 6-digit berikut untuk masuk atau memverifikasi email kamu di platform Hingo:
          </p>

          <div style="background-color: #FFFBEB; border: 2px dashed #FDE68A; border-radius: 14px; padding: 18px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #1A1A1A; font-family: monospace;">${otpCode}</span>
          </div>

          <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888; text-align: center;">
            ⏱️ <strong>Masa berlaku 5 menit</strong>. Jangan berikan kode ini kepada siapapun termasuk staf Hingo.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px;">
          <p style="margin: 0; font-size: 11px; color: #999999;">
            © ${new Date().getFullYear()} Hingo Indonesia. Layanan Titip Jual & Beli Gear Gaming Terverifikasi.
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: email,
      subject: `Kode OTP Hingo: ${otpCode} (Berlaku 5 Menit)`,
      html: htmlContent,
      text: `Kode OTP Hingo kamu adalah: ${otpCode}. Berlaku selama 5 menit. Jangan berikan kode ini kepada siapapun.`,
    });

    console.log(`✓ [SMTP] Email OTP sukses dikirim ke ${email}`);
    return { delivered: true };
  } catch (err: any) {
    console.error("Gagal mengirim email OTP via SMTP:", err.message);
    return { delivered: false, info: err.message };
  }
}

export async function sendOtpWhatsApp(phone: string, otpCode: string): Promise<{ delivered: boolean; info?: string }> {
  const normalizedPhone = normalizePhoneNumber(phone);
  const fonnteToken = process.env.FONNTE_TOKEN;

  // Check if Fonnte Token is configured
  if (!fonnteToken || fonnteToken.trim() === "" || fonnteToken.includes("PASTE_TOKEN")) {
    console.log(`\n==================================================`);
    console.log(`[DEV NOTICE - WHATSAPP OTP SIMULATED]`);
    console.log(`Tujuan WA     : ${phone} -> ${normalizedPhone}`);
    console.log(`Kode OTP 6-Digit: ${otpCode}`);
    console.log(`(Isi FONNTE_TOKEN di .env untuk pengiriman WA asli)`);
    console.log(`==================================================\n`);
    return { delivered: false, info: "Dev simulation (FONNTE_TOKEN not set)" };
  }

  const message = `Halo! Kode OTP Hingo kamu adalah: *${otpCode}*.\n\nBerlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku sebagai Hingo.`;

  try {
    const formData = new URLSearchParams();
    formData.append("target", normalizedPhone);
    formData.append("message", message);
    formData.append("countryCode", "62");

    const res = await fetch("https://api.fonnte.com/send", {
      method: "POST",
      headers: {
        Authorization: fonnteToken,
      },
      body: formData,
    });

    const data = await res.json();
    if (data.status) {
      console.log(`✓ [FONNTE] WhatsApp OTP sukses dikirim ke ${normalizedPhone}`);
      return { delivered: true };
    } else {
      console.warn(`[FONNTE WARN] Response dari Fonnte:`, data.reason || data);
      return { delivered: false, info: data.reason || "Fonnte API rejected" };
    }
  } catch (err: any) {
    console.error("Gagal mengirim WhatsApp OTP via Fonnte:", err.message);
    return { delivered: false, info: err.message };
  }
}

