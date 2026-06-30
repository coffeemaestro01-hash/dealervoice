import { NextRequest, NextResponse } from "next/server";
import { processInboundInboxEmail, type InboundEmailPayload } from "@/lib/inbox/inbound";

function verifyInboundWebhook(req: NextRequest): boolean {
  const secret =
    process.env.INBOX_INBOUND_WEBHOOK_SECRET ||
    process.env.RESEND_WEBHOOK_SECRET ||
    process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;
  return req.headers.get("x-inbox-webhook-secret") === secret;
}

function normalizePayload(body: Record<string, unknown>): InboundEmailPayload | null {
  const type = body.type as string | undefined;
  const data = (body.data ?? body) as Record<string, unknown>;

  if (type && type !== "email.received") {
    return null;
  }

  const from = (data.from as string | undefined) ?? (data.sender as string | undefined);
  const subject = (data.subject as string | undefined) ?? "";
  if (!from) return null;

  const toRaw = data.to;
  const to = Array.isArray(toRaw)
    ? toRaw.map(String)
    : typeof toRaw === "string"
      ? [toRaw]
      : [];

  if (to.length === 0) return null;

  return {
    from,
    to,
    subject,
    text: (data.text as string | undefined) ?? (data.body as string | undefined),
    html: data.html as string | undefined,
    messageId: (data.email_id as string | undefined) ?? (data.message_id as string | undefined),
  };
}

/** Resend inbound webhook — customer email → Inbox ticket (new or threaded). */
export async function POST(req: NextRequest) {
  if (!verifyInboundWebhook(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const payload = normalizePayload(body);
  if (!payload) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const result = await processInboundInboxEmail(payload);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 422 });
  }

  return NextResponse.json({
    ok: true,
    ticketId: result.ticketId,
    threaded: result.threaded,
  });
}
