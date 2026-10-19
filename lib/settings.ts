// Site settings in Supabase (table public.site_settings, key = "main").
import { unstable_cache, revalidateTag } from "next/cache";
import { db, must } from "./supabase/admin";
export type Settings = { shipPhnomPenhCents: number; shipProvinceCents: number; telegramUrl: string; facebookUrl: string; logoUrl: string; banners: string[] };
export const DEFAULT_SETTINGS: Settings = { shipPhnomPenhCents: 150, shipProvinceCents: 200, telegramUrl: "", facebookUrl: "", logoUrl: "/img/logo.png", banners: [] };
const read = unstable_cache(async (): Promise<Settings> => {
  try { const r = must(await db().from("site_settings").select("value").eq("key", "main").maybeSingle()) as { value: Partial<Settings> } | null; const v = { ...DEFAULT_SETTINGS, ...(r?.value ?? {}) }; if (!Array.isArray(v.banners)) v.banners = []; return v; }
  catch { return DEFAULT_SETTINGS; }
}, ["site-settings"], { tags: ["settings"], revalidate: 60 });
export const getSettings = read;
export async function saveSettings(patch: Partial<Settings>) {
  const next = { ...(await getSettings()), ...patch };
  must(await db().from("site_settings").upsert({ key: "main", value: next, updated_at: new Date().toISOString() }).select("key").single());
  revalidateTag("settings");
}
