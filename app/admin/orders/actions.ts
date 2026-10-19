"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { getOrder, updateOrder } from "@/lib/store";
import { canPay } from "@/lib/orders";
/** Manual verification by an authorized admin (audit: admin email + time). Not a provider-verified payment. */
export async function markPaidManually(orderNumber: string) {
  const admin = await requireAdmin(); const o = await getOrder(orderNumber);
  if (!o || !canPay(o.paymentStatus, "PAID")) return;
  await updateOrder(orderNumber, (x) => { x.paymentStatus = "PAID"; x.paidAt = new Date().toISOString(); x.paidManuallyBy = admin.email ?? "admin"; });
  revalidatePath("/admin/orders");
}
