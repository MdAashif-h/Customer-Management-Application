"use server";
import { revalidatePath } from "next/cache";
import { createCustomer, deleteCustomer, updateCustomer } from "@/lib/db/customers";
import type { CustomerInput } from "@/lib/validation/customer";
export async function createCustomerAction(input: CustomerInput) { const result = await createCustomer(input); revalidatePath("/customers"); return result; }
export async function updateCustomerAction(id: string, input: CustomerInput) { const result = await updateCustomer(id, input); revalidatePath(`/customers/${id}`); revalidatePath("/customers"); return result; }
export async function deleteCustomerAction(id: string) { const result = await deleteCustomer(id); revalidatePath("/customers"); return result; }