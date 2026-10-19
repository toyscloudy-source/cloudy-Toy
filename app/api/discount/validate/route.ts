import { NextResponse } from "next/server";
import { z } from "zod";
import { listProducts } from "@/lib/productStore";
import { computeTotals, PricedProduct } from "@/lib/pricing";
import { resolveDiscount } from "@/lib/discountResolve";
import { normalizeCode, CODE_RE } from "@/lib/discount";
import { tooMany, clientKey } from "@/lib/rateLimit";
/** Preview only: tells the customer how much a code takes off. Does NOT use up the code (checkout does that). */
export async function POST(req: Request) {
  if (tooMany(`v:${clientKey(req)}`)) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const b = z.object({ code: z.string().max(40), lines: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(99) })).min(1).max(50) }).safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const code = normalizeCode(b.data.code);
  if (!CODE_RE.test(code)) return NextResponse.json({ error: "That discount code is not valid." }, { status: 400 });
  try {
    const products = await listProducts();
    const catalog = new Map<string, PricedProduct>(products.map((p) => [p.id, { id: p.id, name: p.name, priceCents: Math.round(p.price * 100), saleCents: p.salePrice ? Math.round(p.salePrice * 100) : null, stock: p.stock, active: true }]));
    const t = computeTotals(b.data.lines, catalog, 0);
    const ev = await resolveDiscount(code, t.items);
    return ev.ok ? NextResponse.json({ code, discountCents: ev.discountCents }) : NextResponse.json({ error: ev.error }, { status: 400 });
  } catch { return NextResponse.json({ error: "Could not check the code right now." }, { status: 400 }); }
}
