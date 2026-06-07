import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";
import { isSuperAdmin } from "@/lib/admin/guards";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isSuperAdmin(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const page = Math.max(1, Number(new URL(req.url).searchParams.get("page") ?? 1));
  const limit = 40;

  const [total, logs] = await Promise.all([
    prisma.webhookLog.count(),
    prisma.webhookLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data: logs, total, page });
}
