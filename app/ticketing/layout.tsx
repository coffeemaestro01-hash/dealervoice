import { requireRole } from "@/lib/auth/session";
import { InboxShell } from "@/components/inbox/InboxShell";

export default async function TicketingLayout({ children }: { children: React.ReactNode }) {
  await requireRole("DEALER_OWNER", "DEALER_GROUP_ADMIN", "MODERATOR", "SUPER_ADMIN");
  return <InboxShell>{children}</InboxShell>;
}
