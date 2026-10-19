import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrder, updateOrder } from "@/lib/store";
import { sendPaidClaimEmail } from "@/lib/email";
/** Customer pressed "I have paid" and closed the dialog: email the admin once per order. Never marks the order paid. */
export async function POST(req: Request) {
  const body = z.object({ orderNumber: z.string().regex(/^CT-[0-9A-Z-]{6,30}$/) }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const o = await getOrder(body.data.orderNumber);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (o.paymentStatus !== "PENDING" || o.method !== "QR_IMAGE") return NextResponse.json({ status: "IGNORED" });
  if (o.claimedPaidAt && o.claimEmail?.status === "SENT") return NextResponse.json({ status: "SENT", already: true });
  const r = await sendPaidClaimEmail(o);
  await updateOrder(o.orderNumber, (x) => { x.claimedPaidAt = x.claimedPaidAt ?? new Date().toISOString(); x.claimEmail = r; });
  return NextResponse.json({ status: r.status });
}
