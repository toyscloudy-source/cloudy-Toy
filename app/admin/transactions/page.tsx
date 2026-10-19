import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listAllOrders } from "@/lib/store";
import { methodLabel } from "@/lib/delivery";
import { filterOrders, sortOrders, summarize, usd, stamp } from "@/lib/stats";
import { PAYMENT_STATUSES } from "@/lib/orders";
import { proofUrls } from "@/lib/proofStore";
import ExportButtons from "@/components/admin/ExportButtons";
import DeleteButton from "@/components/admin/DeleteButton";
import { clearTransactionsAction } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Transactions", robots: { index: false } };
export default async function Transactions(props: { searchParams: Promise<{ sort?: string; status?: string; from?: string; to?: string; cleared?: string; error?: string }> }) { const searchParams = await props.searchParams;
  await requireAdmin();
  const sort = ["low", "high", "new", "oldest"].includes(searchParams.sort ?? "") ? searchParams.sort! : "high";
  const f = { status: searchParams.status, from: searchParams.from, to: searchParams.to };
  const rows = sortOrders(filterOrders(await listAllOrders(), f), sort), s = summarize(rows); const urls = await proofUrls(rows.map((o) => o.paymentProof ?? ""));
  const cls = "rounded-full border border-sky-border bg-white px-4 py-2", card = "rounded-xl2 border border-sky-border bg-white p-4";
  return (<div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Transactions</h1><div className="flex flex-wrap items-center gap-2"><ExportButtons type="transactions" params={{ ...f, sort }} /><DeleteButton action={clearTransactionsAction} label="Clear all transactions" message="Delete ALL transactions and orders permanently? This cannot be undone. Export them first if you need a copy." /></div></div>
    {searchParams.cleared && <p role="status" className="rounded-xl bg-green-100 p-3">All transactions cleared</p>}{searchParams.error && <p role="alert" className="rounded-xl bg-red-100 p-3">{searchParams.error}</p>}
    <form className="flex flex-wrap items-end gap-2">
      <label className="text-sm">Sort<select name="sort" defaultValue={sort} className={`${cls} block`}><option value="high">Highest first</option><option value="low">Lowest first</option><option value="new">Newest first</option><option value="oldest">Oldest first</option></select></label>
      <label className="text-sm">Status<select name="status" defaultValue={searchParams.status ?? "ALL"} className={`${cls} block`}><option value="ALL">All</option>{PAYMENT_STATUSES.map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="text-sm">From<input type="date" name="from" defaultValue={searchParams.from} className={`${cls} block`} /></label>
      <label className="text-sm">To<input type="date" name="to" defaultValue={searchParams.to} className={`${cls} block`} /></label>
      <button className="rounded-full bg-sky px-5 py-2 font-bold hover:bg-sky-hover">Apply</button><Link href="/admin/transactions" className={cls}>Reset</Link></form>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className={card}><p className="text-sm text-mute">Transactions</p><p className="text-xl font-extrabold">{s.count}</p></div><div className={card}><p className="text-sm text-mute">Lowest</p><p className="text-xl font-extrabold">{usd(s.minCents)}</p></div><div className={card}><p className="text-sm text-mute">Highest</p><p className="text-xl font-extrabold">{usd(s.maxCents)}</p></div><div className={card}><p className="text-sm text-mute">Average · Paid total</p><p className="text-xl font-extrabold">{usd(s.avgCents)} · {usd(s.paidCents)}</p></div></div>
    {rows.length === 0 ? <p className="rounded-xl2 bg-sky-pale p-6">No transactions match.</p> :
      <div className="overflow-x-auto rounded-xl2 border border-sky-border bg-white"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-sky-pale"><tr>{["Order", "Date", "Customer", "Method", "Payment screenshot", "Status", "Delivery", "Total"].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>{rows.map((o) => <tr key={o.orderNumber} className="border-t border-sky-border"><td className="p-3 font-semibold">{o.orderNumber}</td><td className="p-3">{stamp(o.createdAt)}</td><td className="p-3">{o.customer.name}</td><td className="p-3">{methodLabel(o.method)}</td><td className="p-3">{o.paymentProof && urls[o.paymentProof] ? <a href={urls[o.paymentProof]} target="_blank" rel="noopener noreferrer" title="Open full image">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={urls[o.paymentProof]} alt={`Payment screenshot for ${o.orderNumber}`} className="h-16 w-16 rounded-lg border border-sky-border object-cover" /></a> : <span className="text-mute">{o.method === "QR_IMAGE" ? "Not uploaded" : "-"}</span>}</td><td className="p-3">{o.paymentStatus}</td><td className="p-3">{usd(o.shippingCents)}</td><td className="p-3 font-bold">{usd(o.totalCents)}</td></tr>)}</tbody></table></div>}</div>);
}
