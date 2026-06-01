import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/db";

export async function POST(req: NextRequest) {
  let token: string | undefined;
  let password: string | undefined;
  try {
    ({ token, password } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!token || !password) {
    return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 422 });
  }

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return NextResponse.json({ error: "Invalid or already-used reset link." }, { status: 400 });
  }
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
    return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.update({ where: { email: record.identifier }, data: { passwordHash } });
  await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

  return NextResponse.json({ message: "Password reset successfully. You can now sign in." });
}
