"use server";
import { revalidatePath } from "next/cache";
import { changeSupabaseTeamRole } from "@/lib/supabase/workspace";
import type { Role } from "@/lib/permissions";
export async function changeUserRoleAction(id: string, role: Role) { const result = await changeSupabaseTeamRole(id, role); revalidatePath("/team-members"); revalidatePath("/activity"); return result; }