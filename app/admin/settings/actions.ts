"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { revalidatePath } from "next/cache";
import { getSettings, saveSettings, DEFAULT_SETTINGS } from "@/lib/settings";
import { uploadProductImage, deleteProductImages } from "@/lib/productStore";
import { validateImage } from "@/lib/images";
const Url = z.string().trim().max(300).refine((v) => v === "" || /^https:\/\/[^\s]+$/.test(v), "Links must start with https://");
const Fee = z.coerce.number().min(0).max(100);
export async function saveStoreSettings(form: FormData) {
  await requireAdmin();
  const p = z.object({ pp: Fee, prov: Fee, tg: Url, fb: Url }).safeParse({ pp: form.get("pp"), prov: form.get("prov"), tg: form.get("tg") ?? "", fb: form.get("fb") ?? "" });
  if (!p.success) redirect(`/admin/settings?error=${encodeURIComponent(p.error.issues[0]?.message ?? "Invalid input")}`);
  const patch: Record<string, string | number> = { shipPhnomPenhCents: Math.round(p.data.pp * 100), shipProvinceCents: Math.round(p.data.prov * 100), telegramUrl: p.data.tg, facebookUrl: p.data.fb };
  await saveSettings(patch); redirect("/admin/settings?saved=1");
}

/** Admin uploads a new logo (or resets to the built-in one). Stored in Supabase Storage; URL saved in site_settings. */
export async function saveLogo(form: FormData) {
  await requireAdmin();
  const back = (q: string) => redirect(`/admin/settings?${q}`);
  const old = (await getSettings()).logoUrl;
  let next = DEFAULT_SETTINGS.logoUrl, uploaded: string | null = null;
  if (form.get("reset") !== "on") {
    const f = form.get("logo");
    if (!(f instanceof File) || f.size === 0) return back("error=" + encodeURIComponent("Choose an image file first"));
    const bytes = new Uint8Array(await f.arrayBuffer()); const v = validateImage(bytes, f.type);
    if (!v.ok) return back("error=" + encodeURIComponent(v.error));
    uploaded = await uploadProductImage(`logo-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}.${v.ext}`, bytes, v.mime); next = uploaded;
  }
  try { await saveSettings({ logoUrl: next }); }
  catch { if (uploaded) await deleteProductImages([uploaded]); return back("error=" + encodeURIComponent("Could not save the logo. Please try again.")); }
  if (old && old !== next && old.includes("/logo-")) await deleteProductImages([old]); // remove the previous uploaded logo
  revalidatePath("/", "layout"); redirect("/admin/settings?saved=1");
}

const MAX_BANNERS = 6;
/** Banner images for the home page: keep the ticked ones, add new uploads (JPEG, PNG or WebP, up to 5 MB each), delete the rest from storage. */
export async function saveBanners(form: FormData) {
  await requireAdmin();
  const back = (q: string) => redirect(`/admin/settings?${q}`);
  const old = (await getSettings()).banners ?? [];
  const keep = old.filter((b) => form.getAll("keep").map(String).includes(b));
  const files = form.getAll("banners").filter((f): f is File => f instanceof File && f.size > 0);
  if (keep.length + files.length > MAX_BANNERS) return back("error=" + encodeURIComponent(`At most ${MAX_BANNERS} banner images`));
  const uploaded: string[] = [];
  try {
    for (const f of files) {
      const bytes = new Uint8Array(await f.arrayBuffer()); const v = validateImage(bytes, f.type);
      if (!v.ok) { await deleteProductImages(uploaded); return back("error=" + encodeURIComponent(`${f.name}: ${v.error}`)); }
      uploaded.push(await uploadProductImage(`banner-${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}.${v.ext}`, bytes, v.mime));
    }
    await saveSettings({ banners: [...keep, ...uploaded] });
  } catch { await deleteProductImages(uploaded); return back("error=" + encodeURIComponent("Could not save the banners. Please try again.")); }
  await deleteProductImages(old.filter((b) => !keep.includes(b))); // only after the new list is saved
  revalidatePath("/", "layout"); redirect("/admin/settings?saved=1");
}
