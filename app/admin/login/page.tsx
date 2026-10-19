import { redirect } from "next/navigation";
import GoogleButton from "@/components/GoogleButton";
import { getAdminOrNull } from "@/lib/admin";
import { getSettings } from "@/lib/settings";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin login", robots: { index: false } };
export default async function AdminLogin(props: { searchParams: Promise<{ error?: string }> }) { const searchParams = await props.searchParams;
  if (await getAdminOrNull()) redirect("/admin");
  const { logoUrl } = await getSettings();
  return (<div className="mx-auto max-w-md space-y-4 rounded-xl2 border border-sky-border bg-white p-8 text-center shadow-soft">
    {/* eslint-disable-next-line @next/next/no-img-element */}<img src={logoUrl} alt="Cloudy Toys" className="mx-auto h-24 w-auto rounded-xl" />
    <h1 className="text-2xl font-extrabold">Admin login</h1>
    <p className="text-mute">Only the store owner&apos;s Google account can sign in here. It opens the admin dashboard only.</p>
    {searchParams.error === "denied" && <p role="alert" className="rounded-xl bg-red-100 p-3 text-red-800">That Google account is not the admin account.</p>}
    {searchParams.error === "auth" && <p role="alert" className="rounded-xl bg-red-100 p-3 text-red-800">Sign-in was cancelled or failed. Please try again.</p>}
    <GoogleButton next="/admin" label="Admin sign in with Google" /></div>);
}
