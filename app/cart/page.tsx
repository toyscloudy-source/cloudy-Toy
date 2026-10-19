import CartView from "@/components/CartView";
import { listProducts } from "@/lib/productStore";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Cart" };
export default async function Cart() {
  const [all, s] = await Promise.all([listProducts(), getSettings()]);
  const products = all.map((p) => ({ id: p.id, name: p.name, price: p.price, salePrice: p.salePrice, slug: p.slug, image: p.images[0]?.src, category: p.category, stock: p.stock }));
  return <CartView products={products} telegram={s.telegramUrl || process.env.NEXT_PUBLIC_TELEGRAM_URL || ""} />;
}
