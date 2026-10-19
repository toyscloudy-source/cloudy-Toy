import { requireAdmin } from "@/lib/admin";
import { getAllPages, PAGE_DEFS, MAX_CONTENT } from "@/lib/pages";
import DeleteButton from "@/components/admin/DeleteButton";
import { savePageAction, deletePageAction, restorePageAction } from "./actions";
export const dynamic = "force-dynamic";
export default async function AdminPages(props: { searchParams: Promise<{ saved?: string; deleted?: string; error?: string }> }) { const searchParams = await props.searchParams;
  await requireAdmin(); const pages = await getAllPages();
  return (<div className="max-w-3xl space-y-6"><h1 className="text-3xl font-extrabold">Pages</h1>
    <p className="text-sm text-mute">Write the text of your shop pages here. Use a line starting with <code>## </code> for a heading, and a blank line between paragraphs. Plain text only. The Contact page also shows your Telegram, Facebook (set in Settings) and email buttons automatically. Deleting a page hides it and removes its footer link; you can restore it any time.</p>
    {searchParams.saved && <p role="status" className="rounded-xl bg-green-100 p-3">Saved</p>}{searchParams.deleted && <p role="status" className="rounded-xl bg-green-100 p-3">Page deleted (hidden from the shop)</p>}
    {searchParams.error && <p role="alert" className="rounded-xl bg-red-100 p-3">{searchParams.error}</p>}
    {PAGE_DEFS.map((d) => { const p = pages[d.slug]; return (<section key={d.slug} className="space-y-3 rounded-xl2 border border-sky-border bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xl font-extrabold">{d.title}{p.deleted && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">Deleted</span>}</h2>
        <div className="flex gap-2"><a href={`/${d.slug}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-sky-border px-4 py-2 text-sm font-bold hover:bg-sky-pale">View page</a>
          {d.deletable && (p.deleted ? <form action={restorePageAction.bind(null, d.slug)}><button className="rounded-full border border-sky-border px-4 py-2 text-sm font-bold hover:bg-sky-pale">Restore</button></form>
            : <DeleteButton action={deletePageAction.bind(null, d.slug)} message={`Delete the ${d.title} page? It will be hidden from the shop and its footer link removed.`} />)}</div></div>
      <form action={savePageAction} className="space-y-2"><input type="hidden" name="slug" value={d.slug} />
        <textarea name="content" rows={d.slug === "about" ? 14 : 8} maxLength={MAX_CONTENT} defaultValue={p.content} placeholder={`Write the ${d.title} page here…`} className="w-full rounded-xl border border-sky-border bg-white px-4 py-3" />
        <button className="min-h-11 rounded-full bg-sky px-8 font-bold hover:bg-sky-hover">{p.deleted ? "Save and restore" : "Save"}</button></form></section>); })}</div>);
}
