import "server-only";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase-server";
import { createAdminSupabase } from "@/lib/supabase-admin";

/**
 * Confirms the caller is signed in AND on the admins allow-list. Redirects to
 * /admin/login otherwise. Call this at the top of every admin page and every
 * admin server action — proxy-level checks alone aren't enough, since Server
 * Actions aren't covered by proxy matchers.
 */
export async function requireAdmin() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    redirect("/admin/login");
  }

  const adminSupabase = createAdminSupabase();
  const { data: allowed } = await adminSupabase
    .from("admins")
    .select("email")
    .eq("email", user.email)
    .maybeSingle();

  if (!allowed) {
    redirect("/admin/login?error=not_authorized");
  }

  return user;
}
