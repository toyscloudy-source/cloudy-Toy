import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/store";
import { sendPaidOrderEmail } from "@/lib/email";
import { tooMany, clientKey } from "@/lib/rateLimit";
/** Customer pressed "I have paid" on the QR page: email the full order to the admin (once). The popup never waits on this. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as { orderNumber?: unknown } | null;
  const n = typeof body?.orderNumber === "string" ? body.orderNumber.trim() : "";
  if (!/^CT-[0-9]{6}-[A-Z0-9]{5}$/.test(n)) return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  if (tooMany(`claim:${clientKey(req)}`, 10)) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const o = await getOrder(n);
  if (!o || o.method !== "QR_IMAGE") return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (o.paymentStatus === "PENDING" && !o.paymentProof) return NextResponse.json({ error: "Please upload your payment screenshot first." }, { status: 400 });
  if (o.paymentStatus === "PAID" || o.claimEmail?.status === "SENT") return NextResponse.json({ ok: true, already: true, status: "SENT" }); // never email twice
  const r = await sendPaidOrderEmail(o);
  await updateOrder(n, (x) => { x.claimedPaidAt = x.claimedPaidAt ?? new Date().toISOString(); x.claimEmail = r; x.email = { status: r.status, detail: r.detail, attempts: x.email.attempts + 1 }; });
  if (r.status !== "SENT") console.error("[claim email]", n, r.status, r.detail);
  return NextResponse.json({ ok: r.status === "SENT", status: r.status, detail: r.detail });
}
