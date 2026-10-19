// Products in Supabase (table public.products) + images in Supabase Storage (bucket "product-images").
// Permanent: products only disappear when an admin deletes them. No automatic re-seeding.
import { unstable_cache, revalidateTag } from "next/cache";
import type { Product } from "./products";
import { db, must } from "./supabase/admin";
export const LOW_STOCK = 5;
const BUCKET = "product-images";
type Row = { id: string; slug: string; name: string; sku: string; price: number | string; sale_price: number | string | null; stock: number; created_at: string; category: string | null; description: string | null; images: { src: string; alt: string }[] | null; active: boolean };
const toProduct = (r: Row): Product => ({ id: r.id, slug: r.slug, name: r.name, sku: r.sku, price: Number(r.price),
  stock: r.stock, category: r.category ?? "", createdAt: r.created_at, description: r.description ?? "", images: r.images ?? [], active: r.active });
const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

export const stockStatus = (stock: number): "OUT" | "LOW" | "OK" => (stock <= 0 ? "OUT" : stock <= LOW_STOCK ? "LOW" : "OK");
/** Every product, including hidden ones. Admin only. */
export async function listAllProducts(): Promise<Product[]> { return (must(await db().from("products").select("*").order("created_at", { ascending: true })) as Row[]).map(toProduct); }
/** Storefront view: hidden products are never returned. */
const bust = () => revalidateTag("products");
/** Storefront reads are cached (fast) and refreshed instantly whenever the admin or a checkout changes a product. */
export const listProducts = unstable_cache(async (): Promise<Product[]> => (must(await db().from("products").select("*").eq("active", true).order("created_at", { ascending: false })) as Row[]).map(toProduct), ["products-active"], { tags: ["products"], revalidate: 60 });
export async function getProductById(id: string) { if (!isUuid(id)) return null; const r = must(await db().from("products").select("*").eq("id", id).maybeSingle()) as Row | null; return r ? toProduct(r) : null; }
export async function getProductBySlug(slug: string) { return (await listProducts()).find((p) => p.slug === slug) ?? null; }
export const categoriesOf = (list: Product[]) => [...new Set(list.map((p) => p.category).filter(Boolean))].sort();

export function slugify(s: string) { return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "product"; }
export async function upsertProduct(p: Omit<Product, "id" | "slug"> & { id?: string }) {
  const fields = { name: p.name, sku: p.sku, category: p.category, description: p.description, price: p.price, stock: p.stock, images: p.images, active: p.active !== false, updated_at: new Date().toISOString() };
  if (p.id) { must(await db().from("products").update(fields).eq("id", p.id).select("id").single()); bust(); return p.id; }
  const base = slugify(p.name);
  const taken = new Set((must(await db().from("products").select("slug").like("slug", `${base}%`)) as { slug: string }[]).map((x) => x.slug));
  let slug = base, n = 2; while (taken.has(slug)) slug = `${base}-${n++}`;
  const id = (must(await db().from("products").insert({ ...fields, slug }).select("id").single()) as { id: string }).id; bust(); return id;
}
export async function skuTaken(sku: string, exceptId?: string) {
  const rows = must(await db().from("products").select("id").ilike("sku", sku.replace(/[\\%_]/g, "\\$&"))) as { id: string }[];
  return rows.some((r) => r.id !== exceptId);
}
export async function deleteProduct(id: string) {
  const p = await getProductById(id); if (!p) return;
  must(await db().from("products").delete().eq("id", id).select("id")); bust();
  await deleteProductImages(p.images.map((i) => i.src));
}
export async function setStock(id: string, stock: number) { if (!isUuid(id)) return; must(await db().from("products").update({ stock: Math.max(0, Math.floor(stock)), updated_at: new Date().toISOString() }).eq("id", id).select("id")); bust(); }
/** Atomic: throws INSUFFICIENT_STOCK (and changes nothing) if any line exceeds current stock. */
export async function decrementStock(items: { productId: string; qty: number }[]) {
  const r = await db().rpc("decrement_stock", { items });
  if (r.error) throw new Error(r.error.message.includes("INSUFFICIENT_STOCK") ? "INSUFFICIENT_STOCK" : r.error.message);
  bust();
}
/** Undo a decrement (used only if saving the order fails afterwards). */
export async function restoreStock(items: { productId: string; qty: number }[]) { must(await db().rpc("restore_stock", { items })); bust(); }

/** Upload a validated image; returns its permanent public URL. */
export async function uploadProductImage(name: string, bytes: Uint8Array, mime: string) {
  const s = db().storage.from(BUCKET); const r = await s.upload(name, bytes, { contentType: mime, upsert: false, cacheControl: "31536000" });
  if (r.error) throw new Error(r.error.message);
  return s.getPublicUrl(name).data.publicUrl;
}
export async function deleteProductImages(srcs: string[]) {
  const names = srcs.map((s) => s.split("/").pop() ?? "").filter((n) => /^[a-z0-9-]+\.(jpg|png|webp)$/.test(n));
  if (names.length) await db().storage.from(BUCKET).remove(names).catch(() => undefined);
}
