import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "auth_attempt");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let email: string | undefined;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const normalized = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalized }, select: { name: true } });

  // Only act if the user exists, but always return the same response
  // so we never reveal which emails are registered.
  if (user) {
    const token = crypto.randomBytes(32).toString("hex");
    // Clear any prior reset tokens for this email
    await prisma.verificationToken.deleteMany({ where: { identifier: normalized } }).catch(() => {});
    await prisma.verificationToken.create({
      data: { identifier: normalized, token, expires: new Date(Date.now() + 60 * 60 * 1000) },
    });
    await sendPasswordResetEmail(normalized, user.name ?? "there", token).catch(() => {});
  }

  return NextResponse.json({ message: "If an account exists for that email, a reset link has been sent." });
}
