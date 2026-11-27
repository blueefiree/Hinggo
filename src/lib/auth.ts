import { cookies } from "next/headers";
import { User } from "@/types";
import { supabaseAdmin } from "./supabase";

const SESSION_COOKIE_NAME = "hinggo_session_token";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) return null;

    // Decode session format: "userId:role:timestamp"
    const decoded = Buffer.from(sessionToken, "base64").toString("utf-8");
    const [userId] = decoded.split(":");

    if (!userId) return null;

    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .eq("is_active", true)
      .single();

    if (error || !user) return null;

    return user as User;
  } catch (err) {
    return null;
  }
}

export function createSessionToken(user: User): string {
  const payload = `${user.id}:${user.role}:${Date.now()}`;
  return Buffer.from(payload).toString("base64");
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}
