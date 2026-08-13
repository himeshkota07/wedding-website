import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

/**
 * Privileged client using the secret key — bypasses RLS. Only ever call this
 * from server actions/route handlers AFTER requireAdmin() has confirmed the
 * caller is a signed-in, allow-listed admin. Never import from client code.
 */
export function createAdminSupabase() {
  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
