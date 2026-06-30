import { redirect } from "next/navigation";
import { INBOX_BASE_PATH } from "@/lib/inbox/constants";

export default function TicketingPage() {
  redirect(`${INBOX_BASE_PATH}/inbox`);
}
