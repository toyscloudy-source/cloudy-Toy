import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { listAllProducts, stockStatus, LOW_STOCK } from "@/lib/productStore";
import ExportButtons from "@/components/admin/ExportButtons";
import { setStockAction } from "../products/actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Stock", robots: { index: false } };
const badge = { OUT: "bg-red-100 text-red-800", LOW: "bg-amber-100 text-amber-800", OK: "bg-green-100 text-green-800" } as const;
export default async function Stock(props: { searchParams: Promise<{ saved?: string }> }) { const searchParams = await props.searchParams;
  await requireAdmin();
  const list = [...(await listAllProducts())].sort((a, b) => a.stock - b.stock);
  const units = list.reduce((s, p) => s + p.stock, 0), value = list.reduce((s, p) => s + (p.salePrice ?? p.price) * p.stock, 0);
  const out = list.filter((p) => stockStatus(p.stock) === "OUT").length, low = list.filter((p) => stockStatus(p.stock) === "LOW").length;
  const card = "rounded-xl2 border border-sky-border bg-white p-4";
  return (<div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Stock</h1><ExportButtons type="stock" /></div>
    {searchParams.saved && <p role="status" className="rounded-xl bg-green-100 p-3">Saved</p>}
    <div className="grid gap-3 sm:grid-cols-4"><div className={card}><p className="text-sm text-mute">Units in stock</p><p className="text-xl font-extrabold">{units}</p></div><div className={card}><p className="text-sm text-mute">Stock value</p><p className="text-xl font-extrabold">${value.toFixed(2)}</p></div>
      <div className={card}><p className="text-sm text-mute">Out of stock</p><p className="text-xl font-extrabold text-red-700">{out}</p></div><div className={card}><p className="text-sm text-mute">Low (≤ {LOW_STOCK})</p><p className="text-xl font-extrabold text-amber-700">{low}</p></div></div>
    <p className="text-sm text-mute">Lowest stock first. Stock is reduced automatically when an order is placed.</p>
    <ul className="space-y-2">{list.map((p) => <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-sky-border bg-white p-3"><span><Link href={`/admin/products/${p.id}`} className="font-semibold underline">{p.name}</Link><span className="block text-xs text-mute">{p.sku} · {p.category}</span></span>
      <form action={setStockAction.bind(null, p.id)} className="flex items-center gap-2"><input type="hidden" name="back" value="stock" /><span className={`rounded-full px-2 py-0.5 text-xs font-bold ${badge[stockStatus(p.stock)]}`}>{stockStatus(p.stock)}</span>
        <input name="stock" type="number" min="0" step="1" defaultValue={p.stock} aria-label={`Stock for ${p.name}`} className="w-24 rounded-lg border border-sky-border px-2 py-1" /><button className="rounded-full bg-sky px-4 py-1.5 font-bold hover:bg-sky-hover">Update</button></form></li>)}</ul></div>);
}
