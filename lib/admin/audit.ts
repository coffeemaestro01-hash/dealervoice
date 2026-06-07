import type { Prisma } from "@prisma/client";
import prisma from "@/lib/db";

export async function logAdminAction(params: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  oldValues?: Prisma.InputJsonValue;
  newValues?: Prisma.InputJsonValue;
}) {
  await prisma.auditLog.create({ data: params }).catch(() => {});
}
