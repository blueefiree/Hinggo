import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obdczozspvkdebhtyhoh.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_qYJsxxD04jDxX2WXPPysTg_vf8IY1AN";

export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);

