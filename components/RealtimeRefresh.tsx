"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
/** Re-renders the current server page whenever the given tables change in the database (Supabase Realtime).
 *  Optional polling (pollMs) is only used in admin. */
export default function RealtimeRefresh({ tables, indicator = false, pollMs = 0 }: { tables: string[]; indicator?: boolean; pollMs?: number }) {
  const router = useRouter(); const [live, setLive] = useState(false); const key = tables.join(",");
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
    const sb = createClient(); let t: ReturnType<typeof setTimeout>;
    const refresh = () => { clearTimeout(t); t = setTimeout(() => router.refresh(), 250); };
    let ch = sb.channel(`live-${key}`);
    for (const table of key.split(",")) ch = ch.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    ch.subscribe((s) => setLive(s === "SUBSCRIBED"));
    const poll = pollMs > 0 ? setInterval(() => { if (!document.hidden) router.refresh(); }, pollMs) : undefined;
    return () => { clearTimeout(t); if (poll) clearInterval(poll); sb.removeChannel(ch); };
  }, [key, router, pollMs]);
  if (!indicator) return null;
  return <span className="inline-flex items-center gap-1 text-xs text-mute" role="status"><span className={`h-2 w-2 rounded-full ${live ? "bg-green-500" : "bg-amber-400"}`} />{live ? "Live" : "Connecting…"}</span>;
}
