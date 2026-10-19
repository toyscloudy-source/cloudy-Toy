"use client";
import { useFormState } from "react-dom";
import { saveProfile, type ProfileState } from "./actions";
export default function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [s, action] = useFormState<ProfileState, FormData>(saveProfile, {});
  const cls = "w-full rounded-xl border border-sky-border bg-white px-4 py-3";
  return (<form action={action} className="space-y-3"><label className="block">Display name<input name="display_name" defaultValue={name} maxLength={80} className={cls} /></label>
    <label className="block">Phone<input name="phone" type="tel" defaultValue={phone} className={cls} /></label>
    {s.error && <p role="alert" className="text-red-700">{s.error}</p>}{s.ok && <p role="status" className="text-green-700">Saved</p>}
    <button className="min-h-11 rounded-full bg-sky px-6 font-bold hover:bg-sky-hover">Save changes</button></form>);
}
