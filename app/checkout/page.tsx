import CheckoutForm from "@/components/CheckoutForm";
import { getSettings } from "@/lib/settings";
import { listProducts } from "@/lib/productStore";
export const dynamic = "force-dynamic";
export const metadata = { title: "Checkout" };
export default async function Checkout() { const s = await getSettings(); const products = (await listProducts()).map(({ id, name, price, salePrice }) => ({ id, name, price, salePrice }));
  return <CheckoutForm fees={{ pp: s.shipPhnomPenhCents, prov: s.shipProvinceCents }} products={products} telegram={s.telegramUrl} facebook={s.facebookUrl} />; }
