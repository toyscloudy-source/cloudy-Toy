import "./globals.css";
import type { Metadata } from "next";
import CartProvider from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getSettings } from "@/lib/settings";
import { hiddenSlugs } from "@/lib/pages";
export const metadata: Metadata = { title: { default: "Cloudy-Toy", template: "%s | Cloudy-Toy" }, description: "Little Toys, Big Happiness. Toys delivered in Cambodia." };
export default async function Root({children}:{children:React.ReactNode}) {
  const { logoUrl } = await getSettings(); const hidden = await hiddenSlugs();
  return (<html lang="en"><body className="flex min-h-screen flex-col"><CartProvider><Header logoUrl={logoUrl}/><main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    <Footer logoUrl={logoUrl} hidden={hidden}/>
  </CartProvider></body></html>);
}
