"use server";
import { revalidatePath } from "next/cache";
import { getOrder, updateOrder } from "@/lib/store";
import { sendAdminEmail } from "@/lib/email";
import { DEMO_MODE } from "@/lib/payments/demo";
/** TEST ONLY. Refuses to run when real Bakong credentials are configured. Idempotent: pays and emails once. */
export async function simulateTestPayment(orderNumber: string): Promise<void> {
  if (!DEMO_MODE) return;
  const o = await getOrder(orderNumber);
  if (!o || o.paymentStatus !== "PENDING") return;
  const paid = await updateOrder(orderNumber, (x) => { if (x.paymentStatus === "PENDING") { x.paymentStatus = "PAID"; x.paidAt = new Date().toISOString(); } });
  if (paid && paid.email.status === "NONE") {
    const r = await sendAdminEmail(paid);
    await updateOrder(orderNumber, (x) => { x.email = { status: r.status, detail: r.detail, attempts: x.email.attempts + 1 }; });
  }
  revalidatePath(`/payment/${orderNumber}`);
}
