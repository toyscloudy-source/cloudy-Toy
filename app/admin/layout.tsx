import Link from "next/link";
import { getAdminOrNull } from "@/lib/admin";
import RealtimeRefresh from "@/components/RealtimeRefresh";
import { getSettings } from "@/lib/settings";
import AdminNav from "@/components/admin/AdminNav";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminOrNull();
  if (!admin) return <>{children}</>; // login page (each page still calls requireAdmin itself)
  const { logoUrl } = await getSettings();
  return (<div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl2 border border-sky-border bg-white p-4 shadow-soft">
      <Link href="/admin" className="flex items-center gap-3 font-extrabold">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={logoUrl} alt="" className="h-10 w-auto rounded-lg" />Cloudy-Toy Admin</Link>
      <div className="flex flex-wrap items-center gap-3 text-sm"><RealtimeRefresh tables={["orders", "products", "site_settings", "product_discounts"]} indicator pollMs={60000} /><span className="text-mute">{admin.email}</span><Link href="/" className="underline">View shop</Link>
        <form action="/auth/signout" method="post"><button className="rounded-full border border-sky-border px-4 py-2 font-bold hover:bg-sky-pale">Sign out</button></form></div></div>
    <AdminNav />{children}</div>);
}
