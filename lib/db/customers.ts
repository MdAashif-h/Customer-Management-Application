import { Prisma } from "@prisma/client";
type CustomerStatus = "ACTIVE" | "INACTIVE";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { hasPermission, type Permission } from "@/lib/permissions";
import { customerSchema, type CustomerInput } from "@/lib/validation/customer";

async function authorized(permission: Permission) {
  const session = await auth();
  if (!session?.user?.id || !hasPermission(session.user.role, permission)) throw new Error("FORBIDDEN");
  return session.user.id;
}

export async function getCustomers(input: { search?: string; status?: CustomerStatus; company?: string; page?: number; pageSize?: number; sort?: "name" | "company" | "createdAt" | "updatedAt"; direction?: "asc" | "desc" } = {}) {
  await authorized("customers.read");
  const page = Math.max(input.page ?? 1, 1); const pageSize = Math.min(Math.max(input.pageSize ?? 10, 1), 100);
  const search = input.search?.trim();
  const where: Prisma.CustomerWhereInput = { status: input.status, company: input.company || undefined, ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { company: { contains: search } }] } : {}) };
  const [items, total] = await prisma.$transaction([prisma.customer.findMany({ where, orderBy: { [input.sort ?? "createdAt"]: input.direction ?? "desc" }, skip: (page - 1) * pageSize, take: pageSize }), prisma.customer.count({ where })]);
  return { items, total, page, pageSize };
}

export async function getCustomerById(id: string) { await authorized("customers.read"); return prisma.customer.findUnique({ where: { id }, include: { activities: { orderBy: { createdAt: "desc" }, take: 10 } } }); }
export async function createCustomer(input: CustomerInput) { const userId = await authorized("customers.create"); const data = customerSchema.parse(input); return prisma.$transaction(async (tx) => { const customer = await tx.customer.create({ data: { ...data, createdById: userId, updatedById: userId } }); await tx.activity.create({ data: { actorUserId: userId, action: "Customer created", entityType: "customer", entityId: customer.id, customerId: customer.id } }); return customer; }); }
export async function updateCustomer(id: string, input: CustomerInput) { const userId = await authorized("customers.update"); const data = customerSchema.parse(input); return prisma.$transaction(async (tx) => { const customer = await tx.customer.update({ where: { id }, data: { ...data, updatedById: userId } }); await tx.activity.create({ data: { actorUserId: userId, action: "Customer updated", entityType: "customer", entityId: id, customerId: id } }); return customer; }); }
export async function deleteCustomer(id: string) { const userId = await authorized("customers.delete"); return prisma.$transaction(async (tx) => { const customer = await tx.customer.findUniqueOrThrow({ where: { id } }); await tx.activity.create({ data: { actorUserId: userId, action: "Customer deleted", entityType: "customer", entityId: id, metadata: JSON.stringify({ name: customer.name, email: customer.email }) } }); return tx.customer.delete({ where: { id } }); }); }