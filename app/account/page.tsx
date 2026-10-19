import Link from "next/link";
import { requireUser } from "@/lib/supabase/user";
export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };
export default async function Account() {
  const { user } = await requireUser("/account");
  return (<div className="max-w-xl space-y-4"><h1 className="text-3xl font-extrabold">My account</h1>
    <p className="text-mute">Signed in as {user.email}</p>
    <div className="grid gap-3 sm:grid-cols-2"><Link href="/account/profile" className="rounded-xl2 border border-sky-border bg-white p-5 font-bold shadow-soft">Profile</Link><Link href="/account/orders" className="rounded-xl2 border border-sky-border bg-white p-5 font-bold shadow-soft">Order history</Link></div>
    <form action="/auth/signout" method="post"><button className="min-h-11 rounded-full border border-sky-border bg-white px-6 font-bold">Sign out</button></form></div>);
}
