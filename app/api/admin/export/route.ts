import { getAdminOrNull } from "@/lib/admin";
import { listAllOrders } from "@/lib/store";
import { listAllProducts } from "@/lib/productStore";
import { filterOrders, sortOrders } from "@/lib/stats";
import { ordersDataset, transactionsDataset, productsDataset, stockDataset } from "@/lib/exports";
import { toCsv } from "@/lib/csv";
import { buildPdf } from "@/lib/pdf";
export const dynamic = "force-dynamic";
/** GET /api/admin/export?type=orders|transactions|products|stock&format=csv|pdf[&status&from&to&q&sort]  Admin only. */
export async function GET(req: Request) {
  if (!(await getAdminOrNull())) return new Response("Not found", { status: 404 });
  const u = new URL(req.url).searchParams;
  const type = u.get("type") ?? "orders", format = u.get("format") === "pdf" ? "pdf" : "csv";
  const f = { status: u.get("status") ?? undefined, from: u.get("from") ?? undefined, to: u.get("to") ?? undefined, q: u.get("q") ?? undefined };
  let ds;
  if (type === "orders") ds = ordersDataset(sortOrders(filterOrders(await listAllOrders(), f), u.get("sort") ?? "new"));
  else if (type === "transactions") ds = transactionsDataset(sortOrders(filterOrders(await listAllOrders(), f), u.get("sort") ?? "high"));
  else if (type === "products") ds = productsDataset(await listAllProducts());
  else if (type === "stock") ds = stockDataset([...(await listAllProducts())].sort((a, b) => a.stock - b.stock));
  else return new Response("Unknown export type", { status: 400 });
  const date = new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);
  const file = `cloudy-toy-${ds.name}-${date}.${format}`;
  const headers = { "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  if (format === "csv") return new Response(toCsv(ds.rows, ds.csv), { headers: { ...headers, "Content-Type": "text/csv; charset=utf-8" } });
  const sub = `Generated ${date} (Phnom Penh time) - ${ds.rows.length} rows`;
  return new Response(buildPdf({ title: `Cloudy-Toy - ${ds.title}`, subtitle: sub, cols: ds.pdf, rows: ds.rows.map(ds.pdfRow) }), { headers: { ...headers, "Content-Type": "application/pdf" } });
}
