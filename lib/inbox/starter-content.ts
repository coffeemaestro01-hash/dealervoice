/** Generic auto-dealer starter templates (editable, no third-party playbook content). */

export type InboxStarterTemplate = {
  title: string;
  category: string;
  shortcut: string;
  body: string;
};

export const INBOX_STARTER_TEMPLATES: InboxStarterTemplate[] = [
  {
    title: "Service appointment confirmation",
    category: "Service",
    shortcut: "svc-appt",
    body: `Hello {{customer_name}},

Thank you for contacting {{dealership_name}}. We would be happy to schedule your service visit.

Please reply with your preferred date, time, and vehicle year/make/model so we can confirm availability.

Best regards,
{{dealership_name}} Service Team`,
  },
  {
    title: "Business hours",
    category: "General",
    shortcut: "hours",
    body: `Hello {{customer_name}},

Our current business hours are:
Monday-Friday: 9:00 AM - 7:00 PM
Saturday: 9:00 AM - 5:00 PM
Sunday: Closed

If this is an urgent roadside matter, please call us directly at {{dealership_phone}}.

Best regards,
{{dealership_name}}`,
  },
  {
    title: "Recall information request",
    category: "Service",
    shortcut: "recall",
    body: `Hello {{customer_name}},

Thank you for reaching out about a possible recall.

Please share your VIN and we will check open campaigns for your vehicle. If a recall applies, we will help you book the repair at no charge for covered recall work.

Best regards,
{{dealership_name}} Service Team`,
  },
  {
    title: "Parts availability follow-up",
    category: "Parts",
    shortcut: "parts",
    body: `Hello {{customer_name}},

We received your parts inquiry and are checking availability with our parts department.

We will follow up shortly with pricing and estimated arrival time.

Best regards,
{{dealership_name}} Parts Department`,
  },
  {
    title: "Sales inquiry acknowledgment",
    category: "Sales",
    shortcut: "sales",
    body: `Hello {{customer_name}},

Thank you for your interest in {{dealership_name}}.

A member of our sales team will respond with availability, pricing, and next steps. If you already have a trade-in, feel free to include year, make, model, and mileage.

Best regards,
{{dealership_name}} Sales Team`,
  },
  {
    title: "Warranty claim intake",
    category: "Service",
    shortcut: "warranty",
    body: `Hello {{customer_name}},

We can help with your warranty concern.

Please reply with your VIN, current mileage, and a brief description of the issue. Our service advisors will review coverage and contact you with next steps.

Best regards,
{{dealership_name}} Service Team`,
  },
  {
    title: "Status update - investigating",
    category: "General",
    shortcut: "update",
    body: `Hello {{customer_name}},

We are actively looking into your request and will update you as soon as we have more information.

Thank you for your patience.

Best regards,
{{dealership_name}}`,
  },
  {
    title: "Resolved - closing ticket",
    category: "General",
    shortcut: "resolved",
    body: `Hello {{customer_name}},

We believe your request has been resolved. If you need anything else, reply to this message and we will reopen your case.

Thank you for choosing {{dealership_name}}.`,
  },
];

export const INBOX_STARTER_AUTOMATIONS = [
  {
    name: "Tag service keywords",
    trigger: "ticket.created",
    conditions: [{ field: "subject", op: "contains_any", value: ["service", "oil change", "repair", "appointment"] }],
    actions: [{ type: "add_tag", value: "service" }],
  },
  {
    name: "Tag sales keywords",
    trigger: "ticket.created",
    conditions: [{ field: "subject", op: "contains_any", value: ["price", "quote", "test drive", "inventory", "financing"] }],
    actions: [{ type: "add_tag", value: "sales" }],
  },
  {
    name: "High priority - breakdown",
    trigger: "ticket.created",
    conditions: [{ field: "subject", op: "contains_any", value: ["stranded", "breakdown", "won't start", "accident"] }],
    actions: [{ type: "set_priority", value: "HIGH" }, { type: "add_tag", value: "urgent" }],
  },
];

export const DEFAULT_INBOX_SLA = [
  { priority: "HIGH", label: "Urgent", firstResponseHours: 4, resolutionHours: 24 },
  { priority: "MEDIUM", label: "Standard", firstResponseHours: 8, resolutionHours: 48 },
  { priority: "LOW", label: "Low", firstResponseHours: 24, resolutionHours: 72 },
];
