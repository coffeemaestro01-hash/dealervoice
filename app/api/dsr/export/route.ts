import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";
import prisma from "@/lib/db";

// DPDP §11 — returns the signed-in user's own data as a downloadable JSON bundle.
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = session.user.id;

  // Sequential (connection pool = 1)
  const user = await prisma.user.findUnique({
    where: { id: uid },
    select: {
      id: true, email: true, name: true, displayName: true, role: true, status: true,
      locale: true, emailNotifications: true, marketingEmails: true, createdAt: true, lastLoginAt: true,
    },
  });
  const reviews = await prisma.review.findMany({
    where: { authorId: uid },
    select: { id: true, dealershipId: true, overallRating: true, title: true, body: true, status: true, createdAt: true },
  });
  const consents = await prisma.consent.findMany({
    where: { userId: uid },
    orderBy: { createdAt: "desc" },
    select: { purpose: true, status: true, noticeVersion: true, source: true, createdAt: true },
  });
  const dsrRequests = await prisma.dsrRequest.findMany({
    where: { userId: uid },
    select: { kind: true, status: true, slaDueAt: true, completedAt: true, createdAt: true },
  });

  const bundle = {
    schema_version: "1.0",
    generated_at: new Date().toISOString(),
    lawful_basis: "DPDP Act 2023 §11 (Right to Access)",
    data_controller: { name: "DealerVoice", dpo_email: "dpo@dealervoice.io" },
    retention_note: "This file contains the personal data we hold about you at the time of export.",
    profile: user,
    reviews,
    consents,
    dsr_requests: dsrRequests,
  };

  await prisma.auditLog.create({
    data: { userId: uid, action: "dsr.export.downloaded", resource: "DsrRequest", resourceId: uid },
  }).catch(() => {});

  return new NextResponse(JSON.stringify(bundle, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="dealervoice-data-${uid}.json"`,
    },
  });
}
