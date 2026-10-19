// Per-product discounts in Supabase (table public.product_discounts). Server-only; managed by the admin in the product form.
import { db, must } from "./supabase/admin";
export type ProductDiscount = { code: string; percent: number };
export async function getProductDiscount(productId: string): Promise<ProductDiscount | null> {
  const r = must(await db().from("product_discounts").select("code,percent").eq("product_id", productId).maybeSingle()) as { code: string; percent: number | string } | null;
  return r ? { code: r.code, percent: Number(r.percent) } : null;
}
/** Pass null to remove the discount from the product. */
export async function setProductDiscount(productId: string, d: ProductDiscount | null) {
  if (!d) { must(await db().from("product_discounts").delete().eq("product_id", productId).select("product_id")); return; }
  must(await db().from("product_discounts").upsert({ product_id: productId, code: d.code, percent: d.percent }).select("product_id"));
}
export async function percentByProductForCode(code: string) {
  const rows = must(await db().from("product_discounts").select("product_id,percent").eq("code", code)) as { product_id: string; percent: number | string }[];
  return new Map(rows.map((r) => [r.product_id, Number(r.percent)]));
}
