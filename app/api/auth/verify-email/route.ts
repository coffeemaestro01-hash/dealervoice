import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  let token: string | undefined;
  try {
    ({ token } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.json({ error: "Invalid or already-used verification link." }, { status: 400 });
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "This verification link has expired. Please register again." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date(), status: "ACTIVE" },
  });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return NextResponse.json({ message: "Email verified successfully." });
}
