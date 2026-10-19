"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { deleteAllOrders, listAllOrders } from "@/lib/store";
import { deleteProofs } from "@/lib/proofStore";
/** Reset: removes all orders/transactions for good (cannot be undone). Admin only. */
export async function clearTransactionsAction() {
  await requireAdmin();
  try { const proofs = (await listAllOrders()).map((o) => o.paymentProof ?? ""); await deleteAllOrders(); await deleteProofs(proofs); }
  catch { redirect("/admin/transactions?error=" + encodeURIComponent("Could not clear the transactions. Please try again.")); }
  for (const p of ["/admin", "/admin/orders", "/admin/transactions"]) revalidatePath(p);
  redirect("/admin/transactions?cleared=1");
}
