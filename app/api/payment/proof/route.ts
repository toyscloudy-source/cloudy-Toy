import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/store";
import { uploadProof, deleteProofs } from "@/lib/proofStore";
import { validateImage } from "@/lib/images";
import { tooMany, clientKey } from "@/lib/rateLimit";
/** Customer uploads the payment screenshot for a QR order. Required before "I have paid" works. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  const n = String(form?.get("orderNumber") ?? "").trim(); const f = form?.get("proof");
  if (!/^CT-[0-9]{6}-[A-Z0-9]{5}$/.test(n) || !(f instanceof File) || f.size === 0) return NextResponse.json({ error: "Choose your payment screenshot first." }, { status: 400 });
  if (tooMany(`proof:${clientKey(req)}`, 10)) return NextResponse.json({ error: "Too many tries. Please wait a minute." }, { status: 429 });
  const o = await getOrder(n);
  if (!o || o.method !== "QR_IMAGE" || o.paymentStatus !== "PENDING") return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const bytes = new Uint8Array(await f.arrayBuffer()); const v = validateImage(bytes, f.type);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  try {
    const path = await uploadProof(n, bytes, v.mime, v.ext); const oldPath = o.paymentProof;
    await updateOrder(n, (x) => { x.paymentProof = path; x.proofAt = new Date().toISOString(); });
    if (oldPath) await deleteProofs([oldPath]); // replaced by the new one
    return NextResponse.json({ ok: true });
  } catch (e) { console.error("[payment proof]", n, e); return NextResponse.json({ error: "Could not upload the screenshot. Please try again." }, { status: 500 }); }
}
