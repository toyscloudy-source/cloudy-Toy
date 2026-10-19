import GoogleButton from "@/components/GoogleButton";
import { safeNext } from "@/lib/safeRedirect";
export const metadata = { title: "Sign in" };
export default async function Login(props: { searchParams: Promise<{ error?: string; next?: string }> }) { const searchParams = await props.searchParams;
  return (<div className="mx-auto max-w-md space-y-4 rounded-xl2 border border-sky-border bg-white p-8 text-center shadow-soft"><h1 className="text-2xl font-extrabold">Sign in to Cloudy-Toy</h1>
    <p className="text-mute">Your cart is kept while you sign in.</p>
    {searchParams.error && <p role="alert" className="text-red-700">Sign-in was cancelled or failed. Please try again.</p>}
    <GoogleButton next={safeNext(searchParams.next)} /></div>);
}
