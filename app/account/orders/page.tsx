import Link from "next/link";
import { requireUser } from "@/lib/supabase/user";
import { listOrdersByEmail } from "@/lib/store";
export const dynamic = "force-dynamic";
export const metadata = { title: "Order history" };
export default async function Orders() {
  const { user } = await requireUser("/account/orders");
  const orders = user.email ? await listOrdersByEmail(user.email) : [];
  return (<div className="max-w-xl space-y-4"><h1 className="text-3xl font-extrabold">Order history</h1>
    <p className="text-xs text-mute">Test mode: orders are matched by your account email from the local test store. Production will read from the database under row-level security.</p>
    {orders.length === 0 ? <p className="rounded-xl2 bg-sky-pale p-6">No orders yet. <Link href="/shop" className="underline">Browse toys</Link></p>
    : <ul className="space-y-3">{orders.map((o) => <li key={o.orderNumber}><Link href={`/payment/${o.orderNumber}`} className="flex justify-between rounded-xl2 border border-sky-border bg-white p-4"><span>{o.orderNumber}</span><span>${(o.totalCents / 100).toFixed(2)} · {o.paymentStatus}</span></Link></li>)}</ul>}</div>);
}
