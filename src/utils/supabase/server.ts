import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "@/lib/supabase";

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  const { url, key } = getSupabaseEnv();
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Diabaikan jika dipanggil dari Server Component ketika middleware aktif
        }
      },
    },
  });
};
