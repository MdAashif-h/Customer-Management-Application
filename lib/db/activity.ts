import { prisma } from "@/lib/db/prisma";
import { auth } from "@/auth";
import { hasPermission } from "@/lib/permissions";
export async function getActivity() { const session = await auth(); if (!session?.user?.id || !hasPermission(session.user.role, "customers.read")) throw new Error("FORBIDDEN"); return prisma.activity.findMany({ include: { actor: { select: { name: true, email: true } }, customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 100 }); }