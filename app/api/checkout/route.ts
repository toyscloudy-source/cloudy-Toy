import { NextResponse } from "next/server";
import { z } from "zod";
import { listProducts, decrementStock, restoreStock } from "@/lib/productStore";
import { computeTotals, PricedProduct } from "@/lib/pricing";
import { saveOrder, updateOrder } from "@/lib/store";
import { getSettings } from "@/lib/settings";
import { methodAllowed, shippingFor } from "@/lib/delivery";
import { sendAdminEmail } from "@/lib/email";
import { resolveDiscount } from "@/lib/discountResolve";
import { normalizeCode, CODE_RE } from "@/lib/discount";
import { tooMany, clientKey } from "@/lib/rateLimit";
const Body = z.object({
  customer: z.object({ name: z.string().trim().min(2).max(100), email: z.union([z.literal(""), z.string().trim().email().max(200)]).optional().transform((v) => v ?? ""), phone: z.string().trim().min(6).max(30), address: z.string().trim().min(5).max(400), notes: z.string().trim().max(300).optional(), facebook: z.string().trim().max(100).optional(), telegram: z.string().trim().max(100).optional() }),
  lines: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(99) })).min(1).max(50),
  area: z.enum(["PHNOM_PENH", "PROVINCE"]), method: z.enum(["COD", "QR_IMAGE"]), code: z.string().trim().max(40).optional(),
});
const LABELS: Record<string, string> = { name: "Full name (at least 2 characters)", email: "Email (a valid address)", phone: "Phone (at least 6 digits)", address: "Delivery address (5 to 400 characters)", notes: "Delivery instructions (max 300 characters)", area: "Delivery area", method: "Payment method" };
export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = Body.safeParse(raw);
  if (!parsed.success) {
    const bad = [...new Set(parsed.error.issues.map((i) => { const k = String(i.path[0] === "customer" ? i.path[1] : i.path[0]); const v = raw?.customer?.[k]; return (LABELS[k] ?? "Cart items") + (i.path[0] === "customer" ? `, ${typeof v === "string" ? `you entered ${v.trim().length}` : "nothing received"}` : ""); }))];
    return NextResponse.json({ error: `Please check: ${bad.join("; ")}.` }, { status: 400 });
  }
  const { customer, lines, area, method } = parsed.data; const codeIn = normalizeCode(parsed.data.code ?? "");
  if (codeIn && tooMany(`c:${clientKey(req)}`)) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  if (codeIn && !CODE_RE.test(codeIn)) return NextResponse.json({ error: "That discount code is not valid." }, { status: 400 });
  if (!methodAllowed(method, area)) return NextResponse.json({ error: "Pay with delivery is only available in Phnom Penh." }, { status: 400 });
  const settings = await getSettings();
  const products = await listProducts();
  const catalog = new Map<string, PricedProduct>(products.map((p) => [p.id, { id: p.id, name: p.name, priceCents: Math.round(p.price * 100), saleCents: p.salePrice ? Math.round(p.salePrice * 100) : null, stock: p.stock, active: true }]));
  let usedCode: string | undefined;
  try {
    const ship = shippingFor(area, settings);
    let discount = 0;
    if (codeIn) { // admin-created codes only; checked on the server, never trusted from the browser
      const t0 = computeTotals(lines, catalog, ship);
      const ev = await resolveDiscount(codeIn, t0.items);
      if (!ev.ok) return NextResponse.json({ error: ev.error }, { status: 400 });
      usedCode = codeIn; discount = ev.discountCents;
    }
    const t = computeTotals(lines, catalog, ship, discount);
    const orderNumber = `CT-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`;
    const order = { orderNumber, createdAt: new Date().toISOString(), area, method, customer,
      items: t.items.map((i) => ({ productId: i.productId, sku: products.find((p) => p.id === i.productId)!.sku, name: i.name, qty: i.qty, unitCents: i.unitCents, lineCents: i.lineCents })),
      subtotalCents: t.subtotalCents, discountCents: t.discountCents, shippingCents: t.shippingCents, totalCents: t.totalCents, currency: "USD" as const, ...(usedCode ? { discountCode: usedCode } : {}),
      paymentStatus: "PENDING" as const, paymentReference: `PAY-${orderNumber}`, email: { status: "NONE" as const, attempts: 0 } };
    const lines2 = t.items.map((i) => ({ productId: i.productId, qty: i.qty }));
    await decrementStock(lines2); // atomic in the database; throws INSUFFICIENT_STOCK without changing anything
    try { await saveOrder(order); } catch (e) { await restoreStock(lines2); throw e; }
    if (method === "COD") { // QR orders are emailed when the customer presses "I have paid" (/api/payment/claim)
      const r = await sendAdminEmail(order); // order is never lost if email fails; status is recorded
      await updateOrder(orderNumber, (x) => { x.email = { status: r.status, detail: r.detail, attempts: 1 }; });
    }
    return NextResponse.json({ orderNumber });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: msg === "INSUFFICIENT_STOCK" ? "An item is out of stock or exceeds available stock." : "Could not place the order." }, { status: 409 });
  }
}
