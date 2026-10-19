import Link from "next/link";
import { notFound } from "next/navigation";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ProductGallery from "@/components/ProductGallery";
import ProductCard from "@/components/ProductCard";
import { money, isNewProduct } from "@/lib/products";
import { getProductBySlug, listProducts, stockStatus } from "@/lib/productStore";
import AddButton from "./AddButton";
export const dynamic = "force-dynamic";
export async function generateMetadata(props: { params: Promise<{ slug: string }> }) { const params = await props.params; const p = await getProductBySlug(params.slug); return { title: p?.name ?? "Not found", alternates: { canonical: `/product/${params.slug}` } }; }
export default async function ProductPage(props: { params: Promise<{ slug: string }> }) { const params = await props.params;
  const p = await getProductBySlug(params.slug); if (!p) notFound();
  const others = (await listProducts()).filter((x) => x.id !== p.id);
  const more = [...others.filter((x) => x.category === p.category), ...others.filter((x) => x.category !== p.category)].slice(0, 8);
  const st = stockStatus(p.stock);
  return (<div className="space-y-12"><RealtimeRefresh tables={["products"]} />
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mute"><Link href="/shop" className="hover:underline">Shop</Link>{p.category && <> <span aria-hidden="true">/</span> <Link href={`/shop?category=${encodeURIComponent(p.category)}`} className="hover:underline">{p.category}</Link></>}</nav>
      <div className="grid items-start gap-8 md:grid-cols-2 lg:gap-12">
        <ProductGallery images={p.images} name={p.name} />
        <div className="space-y-4 md:sticky md:top-24">
          <div className="flex flex-wrap gap-2">{isNewProduct(p.createdAt) && <span className="rounded-full bg-ink px-3 py-1 text-sm font-extrabold uppercase tracking-wide text-white">New</span>}{p.category && <span className="rounded-full bg-sky-pale px-3 py-1 text-sm font-semibold">{p.category}</span>}</div>
          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{p.name}</h1>
          <p className="text-3xl font-extrabold">{money(p.price)}</p>
          <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-bold ${st === "OUT" ? "bg-red-100 text-red-800" : st === "LOW" ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}><span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />{st === "OUT" ? "Out of stock" : st === "LOW" ? `Only ${p.stock} left` : `${p.stock} in stock`}</p>
          {p.description && <p className="whitespace-pre-line leading-relaxed text-ink/90">{p.description}</p>}
          <AddButton id={p.id} disabled={p.stock <= 0} />
          <p className="text-sm text-mute">SKU {p.sku} · Delivery across Cambodia</p>
        </div></div></div>
    {more.length > 0 && <section aria-labelledby="more-h"><div className="mb-4 flex items-end justify-between gap-3"><h2 id="more-h" className="text-2xl font-extrabold">More toys you may like</h2><Link href="/shop" className="font-semibold underline">See all</Link></div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">{more.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
  </div>);
}
