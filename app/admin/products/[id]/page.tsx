import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { listAllProducts, categoriesOf, getProductById } from "@/lib/productStore";
import ProductForm from "@/components/admin/ProductForm";
import DeleteButton from "@/components/admin/DeleteButton";
import { getProductDiscount } from "@/lib/discountStore";
import { deleteProductAction } from "../actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product", robots: { index: false } };
export default async function EditProduct(props: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { const params = await props.params; const searchParams = await props.searchParams;
  await requireAdmin();
  const p = await getProductById(params.id); if (!p) notFound();
  return (<div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-extrabold">Edit: {p.name}</h1>
      <DeleteButton action={deleteProductAction.bind(null, p.id)} label="Delete product" message={`Delete "${p.name}" permanently? Past orders keep their own copy of the item.`} /></div>
    <ProductForm p={p} error={searchParams.error} categories={categoriesOf(await listAllProducts())} discount={await getProductDiscount(p.id)} /></div>);
}
