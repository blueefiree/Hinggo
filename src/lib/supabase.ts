import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Validasi dan ambil environment variable wajib untuk Supabase.
 * Melempar error spesifik jika variabel belum terdefinisi.
 */
export function getSupabaseEnv(): { url: string; key: string } {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return { url, key };
}

/**
 * Validasi dan ambil environment variable wajib untuk Supabase server-only (service_role).
 * Tidak pernah dipakai di browser dan tidak menggunakan fallback ke anon key.
 */
function getServerSupabaseEnv(): { url: string; serviceRoleKey: string } {
  if (typeof window !== "undefined") {
    throw new Error("Server Supabase client dengan service_role tidak boleh diakses di browser.");
  }
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  return { url, serviceRoleKey };
}

// 1. Client Browser (menggunakan Anon/Publishable Key)
let browserClient: SupabaseClient | null = null;
export function getBrowserSupabase(): SupabaseClient {
  if (typeof window === "undefined") {
    const { url, key } = getSupabaseEnv();
    return createSupabaseClient(url, key);
  }
  if (!browserClient) {
    const { url, key } = getSupabaseEnv();
    browserClient = createSupabaseClient(url, key);
  }
  return browserClient;
}

// 2. Client Server (menggunakan SUPABASE_SERVICE_ROLE_KEY untuk akses tabel ber-RLS setelah verifikasi sesi)
export function createServerSupabase(): SupabaseClient {
  const { url, serviceRoleKey } = getServerSupabaseEnv();
  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Singleton proxy export untuk rute API server
const globalForSupabase = globalThis as unknown as {
  supabaseClient?: SupabaseClient;
};

function getOrCreateServerClient(): SupabaseClient {
  if (globalForSupabase.supabaseClient) {
    return globalForSupabase.supabaseClient;
  }
  const { url, serviceRoleKey } = getServerSupabaseEnv();
  const client = createSupabaseClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseClient = client;
  }
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = getOrCreateServerClient();
    const value = (client as any)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
