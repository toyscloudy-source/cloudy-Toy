import ProductCard from "@/components/ProductCard";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { listProducts, categoriesOf } from "@/lib/productStore";
import Link from "next/link";
export const dynamic = "force-dynamic";
export const metadata = { title: "Shop" };
export default async function Shop(props:{searchParams:Promise<{q?:string;category?:string;sort?:string}>}) {
  const searchParams = await props.searchParams;
  const all=await listProducts(); const q=(searchParams.q??"").toLowerCase();
  let list=all.filter(p=>p.name.toLowerCase().includes(q)&&(!searchParams.category||p.category===searchParams.category));
  if(searchParams.sort==="price-asc") list=[...list].sort((a,b)=>(a.salePrice??a.price)-(b.salePrice??b.price));
  if(searchParams.sort==="price-desc") list=[...list].sort((a,b)=>(b.salePrice??b.price)-(a.salePrice??a.price));
  return (<div><RealtimeRefresh tables={["products"]} /><h1 className="mb-4 text-3xl font-extrabold">Shop</h1>
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="Categories"><Link href="/shop" className="rounded-full border border-sky-border bg-white px-4 py-2">All</Link>{categoriesOf(all).map(c=><Link key={c} href={`/shop?category=${encodeURIComponent(c)}`} className="rounded-full border border-sky-border bg-white px-4 py-2">{c}</Link>)}
      <Link href="?sort=price-asc" className="ml-auto text-sm text-mute">Price ↑</Link><Link href="?sort=price-desc" className="text-sm text-mute">Price ↓</Link></nav>
    {list.length===0?<p className="rounded-xl2 bg-sky-pale p-8 text-center">No toys match. <Link href="/shop" className="underline">Clear filters</Link></p>
    :<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{list.map(p=><ProductCard key={p.id} p={p}/>)}</div>}</div>);
}
