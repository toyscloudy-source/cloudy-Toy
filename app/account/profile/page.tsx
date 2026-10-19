import { requireUser } from "@/lib/supabase/user";
import ProfileForm from "./ProfileForm";
export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };
export default async function Profile() {
  const { user, supabase } = await requireUser("/account/profile");
  const { data } = await supabase.from("profiles").select("display_name, phone").eq("id", user.id).maybeSingle();
  return (<div className="max-w-xl space-y-4"><h1 className="text-3xl font-extrabold">Profile</h1><p className="text-mute">Email: {user.email} (managed by Google)</p>
    <ProfileForm name={data?.display_name ?? (user.user_metadata?.full_name as string) ?? ""} phone={data?.phone ?? ""} /></div>);
}
