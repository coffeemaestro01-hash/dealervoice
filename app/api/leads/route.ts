import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendNewLeadNotification } from "@/lib/email";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

const leadSchema = z.object({
  dealershipId: z.string().min(1),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  vehicle: z.string().max(120).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  type: z.enum(["QUOTE", "TEST_DRIVE", "GENERAL", "FINANCE"]).default("QUOTE"),
  source: z.string().max(200).optional(),
});

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "auth_attempt").catch(() => ({ success: true }));
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  const session = await getServerSession(authOptions).catch(() => null);
  const userId = session?.user?.id ?? null;

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 422 });
  }
  const d = parsed.data;

  const dealer = await prisma.dealership.findUnique({
    where: { id: d.dealershipId, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      staff: {
        where: { isActive: true, role: "owner" },
        take: 1,
        include: { user: { select: { email: true } } },
      },
    },
  });
  if (!dealer) return NextResponse.json({ error: "Dealership not found" }, { status: 404 });

  const lead = await prisma.lead.create({
    data: {
      dealershipId: dealer.id,
      userId: userId,
      name: d.name.trim(),
      email: d.email.toLowerCase().trim(),
      phone: d.phone || null,
      vehicle: d.vehicle || null,
      message: d.message || null,
      type: d.type,
      source: d.source || null,
    },
  });

  const notifyEmail = dealer.staff[0]?.user.email ?? dealer.email;
  if (notifyEmail) {
    await sendNewLeadNotification(notifyEmail, dealer.name, {
      name: d.name.trim(),
      email: d.email.toLowerCase().trim(),
      phone: d.phone || null,
      vehicle: d.vehicle || null,
      message: d.message || null,
      type: d.type,
    }).catch(() => {});
  }

  return NextResponse.json({
    message: "Your request has been sent. The dealership will be in touch soon.",
  });
}
