import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/db";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/auth/rate-limit";
import { sendVerificationEmail } from "@/lib/email";
import { slugify } from "@/lib/utils";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const rl = await rateLimit(req, "auth_attempt");
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 422 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      status: "PENDING_VERIFICATION",
    },
    select: { id: true, email: true, name: true },
  });

  // Store verification token
  await prisma.verificationToken.create({
    data: {
      identifier: normalizedEmail,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await sendVerificationEmail(normalizedEmail, name, verificationToken).catch(() => {});

  return NextResponse.json({ message: "Account created. Please check your email to verify." }, { status: 201 });
}
