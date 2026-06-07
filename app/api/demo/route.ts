import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendDemoRequestEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(6).max(30),
  dealership: z.string().min(2).max(200),
  role: z.string().max(100).optional(),
  monthlyCalls: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  source: z.string().max(50).optional(),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 422 });
  }

  try {
    await sendDemoRequestEmail(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Demo request failed:", err);
    return NextResponse.json({ error: "Could not send request. Email dealers@dealervoice.io directly." }, { status: 500 });
  }
}
