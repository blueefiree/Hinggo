import crypto from "crypto";
import { requireEnv } from "@/lib/env";

export function isDemoMode(): boolean {
  return (
    process.env.DEMO_MODE === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

export function getDemoOtpCode(): string {
  return process.env.DEMO_OTP_CODE?.trim() || "";
}

/**
 * Daftar akun terproteksi (Admin dan Seed) yang DILARANG menggunakan kode demo
 */
export const PROTECTED_ADMIN_TARGETS = new Set([
  "admin@hingo.id",
  "+6281200000001",
  "081200000001",
  "6281200000001",
]);

export function isProtectedTarget(target: string): boolean {
  const clean = target.trim().toLowerCase();
  return PROTECTED_ADMIN_TARGETS.has(clean);
}

interface OtpState {
  hash: string;
  expiresAt: number;
  lastSentAt: number;
  failedAttempts: number;
  lockedUntil: number;
}

// Global in-memory singleton for OTP rate-limiting and tracking
const globalForOtp = globalThis as unknown as {
  __otpTracker?: Map<string, OtpState>;
};

const otpTracker = globalForOtp.__otpTracker || new Map<string, OtpState>();
globalForOtp.__otpTracker = otpTracker;

function getOtpSecret(): string {
  return requireEnv("SESSION_SECRET");
}

export function hashOtp(target: string, otpCode: string): string {
  return crypto
    .createHmac("sha256", getOtpSecret())
    .update(`${target.trim().toLowerCase()}:${otpCode.trim()}`)
    .digest("hex");
}

export interface SendOtpResult {
  allowed: boolean;
  error?: string;
  statusCode?: number;
  otpCode?: string; // Hanya untuk dispatch email/WhatsApp di server, JANGAN dikembalikan ke client
  isDemo?: boolean;
}

export function prepareSendOtp(target: string, options?: { isAdmin?: boolean }): SendOtpResult {
  const cleanTarget = target.trim().toLowerCase();
  const now = Date.now();
  const current = otpTracker.get(cleanTarget);

  // 1. Cek apakah target sedang dikunci sementara (failed attempts >= 5)
  if (current && current.lockedUntil > now) {
    const remainingMinutes = Math.ceil((current.lockedUntil - now) / 60000);
    return {
      allowed: false,
      statusCode: 429,
      error: `Terlalu banyak percobaan salah. Target ini terkunci sementara selama ${remainingMinutes} menit.`,
    };
  }

  // 2. Cek jeda kirim ulang (cooldown 60 detik)
  if (current && current.lastSentAt && now - current.lastSentAt < 60000) {
    const remainingSeconds = Math.ceil((60000 - (now - current.lastSentAt)) / 1000);
    return {
      allowed: false,
      statusCode: 429,
      error: `Harap tunggu ${remainingSeconds} detik sebelum meminta kode baru.`,
    };
  }

  // 3. Tentukan kode OTP
  // Akun ADMIN atau target berstatus proteksi DILARANG menggunakan DEMO_OTP_CODE
  const isTargetAdmin = Boolean(options?.isAdmin) || isProtectedTarget(cleanTarget);
  const demoActive = isDemoMode() && !isTargetAdmin;
  const demoCode = getDemoOtpCode();

  const otpCode = demoActive && demoCode
    ? demoCode
    : crypto.randomInt(100000, 1000000).toString();

  const hashed = hashOtp(cleanTarget, otpCode);
  const expiresAt = now + 5 * 60 * 1000; // 5 menit

  otpTracker.set(cleanTarget, {
    hash: hashed,
    expiresAt,
    lastSentAt: now,
    failedAttempts: current ? current.failedAttempts : 0,
    lockedUntil: 0,
  });

  return {
    allowed: true,
    otpCode,
    isDemo: demoActive,
  };
}

export interface VerifyOtpResult {
  valid: boolean;
  error?: string;
  statusCode?: number;
}

export function verifyOtpInput(
  target: string,
  inputCode: string,
  options?: { isAdmin?: boolean }
): VerifyOtpResult {
  const cleanTarget = target.trim().toLowerCase();
  const cleanCode = inputCode.trim();
  const now = Date.now();
  const current = otpTracker.get(cleanTarget);
  const isTargetAdmin = Boolean(options?.isAdmin) || isProtectedTarget(cleanTarget);
  const demoCode = getDemoOtpCode();

  // 1. Cek jika target sedang dikunci
  if (current && current.lockedUntil > now) {
    const remainingMinutes = Math.ceil((current.lockedUntil - now) / 60000);
    return {
      valid: false,
      statusCode: 429,
      error: `Terlalu banyak percobaan salah. Target ini terkunci sementara selama ${remainingMinutes} menit.`,
    };
  }

  // 2. KEAMANAN ADMIN: KODE DEMO DITOLAK KERAS UNTUK AKUN ADMIN ATAU SEED ADMIN
  if (demoCode && cleanCode === demoCode && isTargetAdmin) {
    return {
      valid: false,
      statusCode: 403,
      error: "Kode demo tidak berlaku untuk akun administrator. Harap gunakan kode OTP resmi yang dikirimkan.",
    };
  }

  // 3. Mode Demo: Kode demo hanya berlaku untuk akun NON-ADMIN jika DEMO_MODE aktif
  if (isDemoMode() && demoCode && cleanCode === demoCode && !isTargetAdmin) {
    if (current) {
      current.failedAttempts = 0;
      current.lockedUntil = 0;
    }
    return { valid: true };
  }

  // 4. Mode Normal / Verifikasi Nyata: Cocokkan hash HMAC-SHA256 dan masa berlaku
  const inputHash = hashOtp(cleanTarget, cleanCode);
  const isMatch = current && current.hash === inputHash && now <= current.expiresAt;

  if (isMatch) {
    if (current) {
      current.failedAttempts = 0;
      current.lockedUntil = 0;
      current.expiresAt = 0; // Invalidate OTP setelah digunakan
    }
    return { valid: true };
  }

  // 5. Gagal verifikasi: Hitung percobaan salah
  const failedAttempts = (current?.failedAttempts || 0) + 1;
  const isLocked = failedAttempts >= 5;
  const lockedUntil = isLocked ? now + 15 * 60 * 1000 : 0;

  otpTracker.set(cleanTarget, {
    hash: current?.hash || "",
    expiresAt: current?.expiresAt || 0,
    lastSentAt: current?.lastSentAt || 0,
    failedAttempts,
    lockedUntil,
  });

  if (isLocked) {
    return {
      valid: false,
      statusCode: 429,
      error: "Terlalu banyak percobaan salah (5/5). Nomor atau email ini terkunci sementara selama 15 menit.",
    };
  }

  const isExpired = current && current.expiresAt && now > current.expiresAt;
  return {
    valid: false,
    statusCode: 400,
    error: isExpired
      ? "Kode verifikasi telah kedaluwarsa. Silakan kirim ulang kode baru."
      : `Kode verifikasi salah atau tidak cocok. (Percobaan ${failedAttempts}/5)`,
  };
}
