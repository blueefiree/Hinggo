import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obdczozspvkdebhtyhoh.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_qYJsxxD04jDxX2WXPPysTg_vf8IY1AN";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

