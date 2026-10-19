import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
import { saveStoreSettings, saveLogo, saveBanners } from "./actions";
export const dynamic = "force-dynamic";
export default async function Settings(props: { searchParams: Promise<{ saved?: string; error?: string }> }) { const searchParams = await props.searchParams;
  await requireAdmin(); const s = await getSettings(); const cls = "w-full rounded-xl border border-sky-border bg-white px-4 py-3";
  return (<div className="max-w-xl space-y-6"><h1 className="text-3xl font-extrabold">Store settings</h1>
    {searchParams.saved && <p role="status" className="rounded-xl bg-green-100 p-3">Saved</p>}{searchParams.error && <p role="alert" className="rounded-xl bg-red-100 p-3">{searchParams.error}</p>}
    <form action={saveLogo} className="space-y-3 rounded-xl2 border border-sky-border bg-white p-4"><p className="font-semibold">Shop logo</p>
      <p className="text-sm text-mute">Shown in the shop header, footer and admin. JPG, PNG or WebP, max 5 MB. A PNG with a transparent background looks best.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src={s.logoUrl} alt="Current logo" className="h-20 w-auto rounded-xl border border-sky-border bg-page p-1" />
      <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" className={cls} />
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="reset" /> Reset to the default logo (ignores the file above)</label>
      <button className="min-h-11 rounded-full bg-sky px-8 font-bold hover:bg-sky-hover">Update logo</button></form>
    <form action={saveBanners} className="space-y-3 rounded-xl2 border border-sky-border bg-white p-4"><p className="font-semibold">Home page banners</p>
      <p className="text-sm text-mute">Shown above &quot;Featured toys&quot; and change every 2 seconds. Up to 6 images (JPG, PNG, WebP, max 5 MB each). Best size: wide, about 1600 × 600.</p>
      {(s.banners ?? []).length > 0 && <div className="flex flex-wrap gap-3">{s.banners.map((b) => <label key={b} className="w-40 text-center text-xs">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={b} alt="Banner" className="h-20 w-40 rounded-lg border border-sky-border object-cover" /><input type="checkbox" name="keep" value={b} defaultChecked /> keep (untick to delete)</label>)}</div>}
      <input name="banners" type="file" multiple accept="image/png,image/jpeg,image/webp" className={cls} />
      <button className="min-h-11 rounded-full bg-sky px-8 font-bold hover:bg-sky-hover">Save banners</button></form>
    <form action={saveStoreSettings} className="space-y-3">
    <label className="block">Delivery fee, Phnom Penh (USD)<input name="pp" type="number" step="0.01" min="0" defaultValue={(s.shipPhnomPenhCents / 100).toFixed(2)} className={cls} /></label>
    <label className="block">Delivery fee, Province (USD)<input name="prov" type="number" step="0.01" min="0" defaultValue={(s.shipProvinceCents / 100).toFixed(2)} className={cls} /></label>
    <label className="block">Telegram link (https://…)<input name="tg" defaultValue={s.telegramUrl} className={cls} /></label>
    <label className="block">Facebook page link (https://…)<input name="fb" defaultValue={s.facebookUrl} className={cls} /></label>
    <div className="rounded-xl2 border border-sky-border bg-white p-4"><p className="font-semibold">Payment QR (ABA PAY)</p><p className="text-sm text-mute">Loaded from <code>public/img/qr-pay.png</code>. To change it, replace that file and restart/redeploy.</p>
      {/* eslint-disable-next-line @next/next/no-img-element */}<img src="/img/qr-pay.png" alt="Current payment QR" className="mt-2 w-48 rounded-xl border border-sky-border" /></div>
    <button className="min-h-11 rounded-full bg-sky px-8 font-bold hover:bg-sky-hover">Save settings</button></form></div>);
}
