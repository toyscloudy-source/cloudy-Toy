"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/user";
import { ProfileInput } from "@/lib/profile";
export type ProfileState = { ok?: boolean; error?: string };
export async function saveProfile(_: ProfileState, form: FormData): Promise<ProfileState> {
  const { user, supabase } = await requireUser("/account/profile");
  const p = ProfileInput.safeParse({ display_name: form.get("display_name") ?? "", phone: form.get("phone") ?? "" });
  if (!p.success) return { error: p.error.issues[0]?.message ?? "Invalid input" };
  const { error } = await supabase.from("profiles").upsert({ id: user.id, ...p.data, updated_at: new Date().toISOString() });
  if (error) return { error: "Could not save. Check that the database migration has been applied." };
  revalidatePath("/account/profile"); return { ok: true };
}
