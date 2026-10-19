"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
export default function GoogleButton({ next = "/account", label = "Continue with Google" }: { next?: string; label?: string }) {
  const [err, setErr] = useState("");
  async function go() {
    try {
      const { error } = await createClient().auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` } });
      if (error) setErr(error.message);
    } catch { setErr("Sign-in is not configured yet. Add the Supabase environment variables."); }
  }
  return (<div><button onClick={go} className="min-h-11 rounded-full bg-sky px-6 font-bold hover:bg-sky-hover">{label}</button>{err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}</div>);
}
