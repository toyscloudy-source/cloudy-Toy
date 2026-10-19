import { notFound } from "next/navigation";
import { isAdminEmail } from "./admin-pure";
import { createClient, supabaseConfigured } from "./supabase/server";
/** Returns the admin user or null (never throws). */
export async function getAdminOrNull() {
  if (!supabaseConfigured()) return null;
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user || !isAdminEmail(user.email, !!user.email_confirmed_at)) return null;
  return user;
}
/** Call at the top of every admin server component/action/route. Unauthorized => branded 404, no data revealed. */
export async function requireAdmin() {
  const user = await getAdminOrNull();
  if (!user) notFound();
  return user;
}
