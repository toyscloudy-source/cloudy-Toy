import { requireAdmin } from "@/lib/admin";
import { listAllProducts, categoriesOf } from "@/lib/productStore";
import ProductForm from "@/components/admin/ProductForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "New product", robots: { index: false } };
export default async function NewProduct(props: { searchParams: Promise<{ error?: string }> }) { const searchParams = await props.searchParams;
  await requireAdmin();
  return (<div className="space-y-4"><h1 className="text-3xl font-extrabold">New product</h1><ProductForm error={searchParams.error} categories={categoriesOf(await listAllProducts())} /></div>);
}
