"use client";
export default function DeleteButton({ action, label = "Delete", message }: { action: () => void | Promise<void>; label?: string; message: string }) {
  return (<form action={action} onSubmit={(e) => { if (!confirm(message)) e.preventDefault(); }}><button className="rounded-full border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 hover:bg-red-50">{label}</button></form>);
}
