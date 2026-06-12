import { getFeatureFlag } from "@/lib/admin/feature-flags";

export async function sendSlackAlert(text: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false, reason: "no_webhook" };

  const enabled = await getFeatureFlag("SLACK_ALERTS_ENABLED");
  if (!enabled) return { sent: false, reason: "disabled" };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Slack webhook failed: ${res.status} ${body}`);
  }
  return { sent: true };
}
