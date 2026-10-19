import { redirect } from "next/navigation";
import { createClient, supabaseConfigured } from "./server";
import { isAdminEmail } from "../admin-pure";
/** Server-side: returns the signed-in customer or redirects to /login. The admin email never uses a customer account: it is sent to /admin. */
export async function requireUser(next = "/account") {
  if (!supabaseConfigured()) redirect(`/login?next=${encodeURIComponent(next)}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (isAdminEmail(user.email, !!user.email_confirmed_at)) redirect("/admin");
  return { user, supabase };
}
