/** Plain links to the admin-only export route. `params` carries the current filters. */
export default function ExportButtons({ type, params = {} }: { type: "orders" | "transactions" | "products" | "stock"; params?: Record<string, string | undefined> }) {
  const qs = (format: string) => new URLSearchParams(Object.entries({ type, format, ...params }).filter(([, v]) => v) as [string, string][]).toString();
  const cls = "rounded-full border border-sky-border bg-white px-4 py-2 text-sm font-bold hover:bg-sky-pale";
  return (<span className="inline-flex gap-2"><a href={`/api/admin/export?${qs("csv")}`} className={cls}>Export CSV</a><a href={`/api/admin/export?${qs("pdf")}`} className={cls}>Export PDF</a></span>);
}
