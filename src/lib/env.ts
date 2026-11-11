/**
 * Validasi Terpusat Variabel Lingkungan (Environment Variables) Hinggo.
 * Mencegah penggunaan fallback/cadangan rahasia tersembunyi.
 * Melempar error spesifik jika variabel wajib belum terdefinisi.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Variabel ${name} belum diisi`);
  }
  return value.trim();
}

export function getRequiredEnv(): {
  supabaseUrl: string;
  supabaseAnonKey: string;
  sessionSecret: string;
} {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  const sessionSecret = requireEnv("SESSION_SECRET");

  return {
    supabaseUrl,
    supabaseAnonKey,
    sessionSecret,
  };
}
