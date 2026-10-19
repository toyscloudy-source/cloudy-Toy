"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { isSlug, savePage, MAX_CONTENT, PAGE_DEFS } from "@/lib/pages";
const done = (q: string) => { revalidatePath("/", "layout"); redirect(`/admin/pages?${q}`); };
export async function savePageAction(form: FormData) {
  await requireAdmin(); const slug = String(form.get("slug") ?? ""); if (!isSlug(slug)) return done("error=" + encodeURIComponent("Unknown page"));
  const content = String(form.get("content") ?? "").replace(/\r\n/g, "\n").trim();
  if (content.length > MAX_CONTENT) return done("error=" + encodeURIComponent(`Too long (max ${MAX_CONTENT} characters)`));
  await savePage(slug, { content, deleted: false }); done(`saved=${slug}`);
}
/** "Delete" hides the page and its footer link and keeps the text, so Restore brings it back. */
export async function deletePageAction(slug: string) {
  await requireAdmin(); const d = PAGE_DEFS.find((p) => p.slug === slug); if (!d || !d.deletable) return done("error=" + encodeURIComponent("This page cannot be deleted"));
  await savePage(d.slug, { deleted: true }); done(`deleted=${slug}`);
}
export async function restorePageAction(slug: string) {
  await requireAdmin(); const d = PAGE_DEFS.find((p) => p.slug === slug); if (!d) return done("error=" + encodeURIComponent("Unknown page"));
  await savePage(d.slug, { deleted: false }); done(`saved=${slug}`);
}
