"use server";

import { headers } from "next/headers";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

const GENERIC_MESSAGE = "If that email is an admin on this site, a sign-in link has been sent.";

export async function sendMagicLink(
  _prevState: { message: string } | undefined,
  formData: FormData,
): Promise<{ message: string }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { message: "Enter an email address." };
  }

  // Pre-check the allow-list so we don't email random addresses, and don't
  // reveal via a different message whether an email is/isn't an admin.
  const adminSupabase = createAdminSupabase();
  const { data: allowed } = await adminSupabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (!allowed) {
    return { message: GENERIC_MESSAGE };
  }

  const supabase = await createServerSupabase();
  const originHeader = (await headers()).get("origin");
  const origin = originHeader || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  return { message: GENERIC_MESSAGE };
}
