import { NextResponse } from "next/server";
import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeRedirect";
import { isAdminEmail } from "@/lib/admin-pure";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));
  const wantsAdmin = next === "/admin" || next.startsWith("/admin/");
  const fail = wantsAdmin ? "/admin/login?error=auth" : "/login?error=auth";
  if (!supabaseConfigured() || !code) return NextResponse.redirect(new URL(fail, url.origin));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL(fail, url.origin));
  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = !!user && isAdminEmail(user.email, !!user.email_confirmed_at);
  // Admin email always lands on the dashboard, never on a customer account.
  if (isAdmin) return NextResponse.redirect(new URL("/admin", url.origin));
  // A non-admin who used the admin login is signed out and refused.
  if (wantsAdmin) { await supabase.auth.signOut(); return NextResponse.redirect(new URL("/admin/login?error=denied", url.origin)); }
  return NextResponse.redirect(new URL(next, url.origin));
}
