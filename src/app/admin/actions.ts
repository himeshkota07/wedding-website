"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { ADMIN_LINK_COOKIE } from "@/lib/admin-auth";

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  // Opening the shared link again signs this browser back in.
  (await cookies()).delete({ name: ADMIN_LINK_COOKIE, path: "/admin" });
  redirect("/admin/login");
}
