// Editable site pages (About, Contact). Stored in public.site_settings, key = "pages".
import { unstable_cache, revalidateTag } from "next/cache";
import { db, must } from "./supabase/admin";
export const PAGE_DEFS = [
  { slug: "about", title: "About", deletable: false },
  { slug: "contact", title: "Contact", deletable: true },
] as const;
export type PageSlug = (typeof PAGE_DEFS)[number]["slug"];
export type PageData = { content: string; deleted: boolean };
export const isSlug = (s: string): s is PageSlug => PAGE_DEFS.some((p) => p.slug === s);
export const MAX_CONTENT = 20000;
/** Starter text for About. Written without invented facts (no dates or names): the owner edits it in Admin > Pages. */
export const DEFAULT_ABOUT = `## Our story

Cloudy-Toy started with one simple idea: little toys can bring big happiness.

We choose toys that are fun, safe and worth giving, and we deliver them across Cambodia, from Phnom Penh to the provinces.

## What we believe

Every child deserves a moment of joy, and every parent deserves a shop they can trust. That is why we keep our prices clear, our delivery simple, and our team easy to reach on Telegram and Facebook.

## Thank you

Thank you for being part of the Cloudy-Toy story.`;
export const DEFAULT_CONTACT = `## Contact our admin

Have a question about an order or a toy? Message our admin and we will reply as soon as we can.

Please include your order number so we can help you faster.`;
const DEFAULTS: Record<PageSlug, string> = { about: DEFAULT_ABOUT, contact: DEFAULT_CONTACT };
type Store = Partial<Record<PageSlug, Partial<PageData>>>;
const read = unstable_cache(async (): Promise<Store> => {
  try { const r = must(await db().from("site_settings").select("value").eq("key", "pages").maybeSingle()) as { value: Store } | null; return r?.value ?? {}; }
  catch { return {}; }
}, ["site-pages"], { tags: ["pages"], revalidate: 60 });
export async function getPage(slug: PageSlug): Promise<PageData> {
  const p = (await read())[slug] ?? {};
  return { content: p.content ?? DEFAULTS[slug], deleted: !!p.deleted };
}
export async function getAllPages(): Promise<Record<PageSlug, PageData>> {
  const s = await read(); const out = {} as Record<PageSlug, PageData>;
  for (const d of PAGE_DEFS) out[d.slug] = { content: s[d.slug]?.content ?? DEFAULTS[d.slug], deleted: !!s[d.slug]?.deleted };
  return out;
}
export async function hiddenSlugs(): Promise<PageSlug[]> { const s = await read(); return PAGE_DEFS.filter((d) => d.deletable && s[d.slug]?.deleted).map((d) => d.slug); }
export async function savePage(slug: PageSlug, patch: Partial<PageData>) {
  const fresh = (must(await db().from("site_settings").select("value").eq("key", "pages").maybeSingle()) as { value: Store } | null)?.value ?? {};
  const next: Store = { ...fresh, [slug]: { ...fresh[slug], ...patch } };
  must(await db().from("site_settings").upsert({ key: "pages", value: next, updated_at: new Date().toISOString() }).select("key").single());
  revalidateTag("pages");
}
