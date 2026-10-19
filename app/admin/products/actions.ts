"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { upsertProduct, deleteProduct, setStock, skuTaken, getProductById, uploadProductImage, deleteProductImages } from "@/lib/productStore";
import { setProductDiscount } from "@/lib/discountStore";
import { CODE_RE, normalizeCode, percentOk } from "@/lib/discount";
import { validateImage, safeFileName } from "@/lib/images";
const MAX_IMAGES = 6;
const Money = z.coerce.number().min(0).max(100000);
const Schema = z.object({
  name: z.string().trim().min(2, "Name needs at least 2 characters").max(120),
  sku: z.string().trim().min(2, "SKU needs at least 2 characters").max(40).regex(/^[A-Za-z0-9-_]+$/, "SKU: letters, numbers, - and _ only"),
  category: z.string().trim().min(1, "Category is required").max(40),
  description: z.string().trim().max(2000), price: Money, stock: z.coerce.number().int("Stock must be a whole number").min(0).max(100000),
});
const refresh = () => { for (const p of ["/", "/shop", "/cart", "/checkout", "/admin", "/admin/products", "/admin/stock"]) revalidatePath(p); };
export async function saveProductAction(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? ""); const back = (q: string) => redirect(`/admin/products/${id || "new"}?${q}`);
  const p = Schema.safeParse(Object.fromEntries(["name", "sku", "category", "description", "price", "stock"].map((k) => [k, form.get(k) ?? ""])));
  if (!p.success) return back(`error=${encodeURIComponent(p.error.issues[0]?.message ?? "Invalid input")}`);
  const d = p.data;
  if (await skuTaken(d.sku, id || undefined)) return back("error=" + encodeURIComponent("That SKU is already used by another product"));
  const pctRaw = String(form.get("discountPercent") ?? "").trim(), codeRaw = normalizeCode(String(form.get("discountCode") ?? ""));
  let discount: { code: string; percent: number } | null = null;
  if (pctRaw || codeRaw) {
    const pct = Number(pctRaw);
    if (!pctRaw || !codeRaw) return back("error=" + encodeURIComponent("Discount needs both a % and a code (or leave both empty)"));
    if (!percentOk(pct)) return back("error=" + encodeURIComponent("Discount % must be a whole number from 10 to 50"));
    if (!CODE_RE.test(codeRaw)) return back("error=" + encodeURIComponent("Discount code: 3-30 letters, numbers, - or _ (e.g. TOY10)"));
    discount = { code: codeRaw, percent: pct };
  }
  const old = id ? await getProductById(id) : null;
  const keep = new Set(form.getAll("keep").map(String));
  const images = (old?.images ?? []).filter((i) => keep.has(i.src));
  const removed = (old?.images ?? []).filter((i) => !keep.has(i.src)).map((i) => i.src);
  const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (images.length + files.length > MAX_IMAGES) return back(`error=${encodeURIComponent(`At most ${MAX_IMAGES} images per product`)}`);
  const uploaded: string[] = [];
  for (const f of files) {
    const bytes = new Uint8Array(await f.arrayBuffer()); const v = validateImage(bytes, f.type);
    if (!v.ok) return back(`error=${encodeURIComponent(`${f.name}: ${v.error}`)}`);
    const src = await uploadProductImage(safeFileName(d.sku, v.ext), bytes, v.mime);
    uploaded.push(src); images.push({ src, alt: d.name });
  }
  try { const savedId = await upsertProduct({ id: id || undefined, name: d.name, sku: d.sku, category: d.category, description: d.description, price: d.price, stock: d.stock, images, active: form.get("active") === "on" }); await setProductDiscount(savedId, discount); }
  catch { await deleteProductImages(uploaded); return back("error=" + encodeURIComponent("Could not save to the database. Nothing was lost; please try again.")); }
  await deleteProductImages(removed); // only after the product row is safely saved
  refresh(); redirect("/admin/products?saved=1");
}
export async function deleteProductAction(id: string) { await requireAdmin(); await deleteProduct(id); refresh(); redirect("/admin/products?deleted=1"); }
export async function setStockAction(id: string, form: FormData) {
  await requireAdmin(); const n = Number(form.get("stock"));
  if (Number.isInteger(n) && n >= 0 && n <= 100000) await setStock(id, n);
  refresh(); redirect(String(form.get("back") ?? "") === "stock" ? "/admin/stock?saved=1" : "/admin/products?saved=1");
}
