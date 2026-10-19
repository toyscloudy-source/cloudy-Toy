import Link from "next/link";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import ProductCard from "@/components/ProductCard";
import { listProducts } from "@/lib/productStore";
import { getSettings } from "@/lib/settings";
import BannerSlider from "@/components/BannerSlider";
export const dynamic = "force-dynamic";
export default async function Home() {
  const products = await listProducts(); const { banners } = await getSettings();
  return (<><RealtimeRefresh tables={["products"]} />
    <section className="rounded-xl2 bg-sky-pale p-10 text-center shadow-soft">
      <h1 className="text-4xl font-extrabold sm:text-6xl">Little Toys, Big Happiness.</h1>
      <p className="mx-auto mt-4 max-w-xl text-mute">Thoughtfully chosen toys for every age, delivered across Cambodia.</p>
      <div className="mt-6 flex justify-center gap-3"><Link href="/shop" className="rounded-full bg-sky px-6 py-3 font-bold hover:bg-sky-hover">Shop Now</Link><Link href="/shop" className="rounded-full border border-sky-border bg-white px-6 py-3 font-bold">Explore Toys</Link></div>
    </section>
    <BannerSlider images={Array.isArray(banners) ? banners : []} />
    <section className="mt-12"><h2 className="mb-4 text-2xl font-extrabold">Featured toys</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{products.slice(0, 8).map(p=><ProductCard key={p.id} p={p}/>)}</div></section>
  </>);
}
