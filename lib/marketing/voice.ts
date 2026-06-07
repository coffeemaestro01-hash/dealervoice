export const VOICE_HERO = {
  headline: "Turn Missed Calls Into Booked Service Appointments.",
  subheadline:
    "DealerVoice answers service and sales calls 24/7, books appointments automatically, and integrates with your existing dealership systems.",
  badge: "AI voice for dealerships · Live in weeks, not months",
};

export const PROBLEM_SOLUTION = {
  problem: {
    title: "The problem: missed calls = lost revenue",
    points: [
      "12–18% of inbound calls go unanswered during peak hours",
      "BDC teams can't scale nights, weekends, and holidays",
      "Every missed service call is a lost repair order",
    ],
  },
  solution: {
    title: "The solution: DealerVoice",
    points: [
      "AI answers every call in under 2 rings",
      "Books service & sales appointments into your calendar",
      "Qualifies leads and routes hot buyers to your team",
    ],
  },
  result: {
    title: "The result: more revenue, less payroll",
    points: [
      "Recover thousands in monthly repair order revenue",
      "Reduce after-hours staffing costs",
      "Increase appointment show-rates with automated reminders",
    ],
  },
};

export const ROI_DEFAULTS = {
  monthlyCalls: 500,
  missedRate: 12,
  avgRepairOrder: 350,
  conversionRate: 35,
};

export const CALL_SAMPLES = [
  {
    id: "service",
    title: "Service appointment booking",
    duration: "1:42",
    outcome: "Appointment booked · Oil change + inspection",
    transcript: [
      { speaker: "DealerVoice", text: "Thanks for calling Metro Ford Service. How can I help you today?" },
      { speaker: "Customer", text: "Hi, I need to schedule an oil change for my 2021 Explorer." },
      { speaker: "DealerVoice", text: "I can help with that. I have Thursday at 9:30 AM or Friday at 2 PM. Which works better?" },
      { speaker: "Customer", text: "Thursday morning works." },
      { speaker: "DealerVoice", text: "Perfect — you're booked for Thursday at 9:30 AM. I'll text you a confirmation now." },
    ],
  },
  {
    id: "sales",
    title: "Sales lead qualification",
    duration: "2:08",
    outcome: "Hot lead routed · Test drive Saturday",
    transcript: [
      { speaker: "DealerVoice", text: "Thanks for calling Premier Toyota. Are you looking for sales or service today?" },
      { speaker: "Customer", text: "I'm interested in a RAV4 Hybrid — do you have any in stock?" },
      { speaker: "DealerVoice", text: "We have three RAV4 Hybrids available. Would you like to schedule a test drive this weekend?" },
      { speaker: "Customer", text: "Yes, Saturday afternoon if possible." },
      { speaker: "DealerVoice", text: "I've scheduled Saturday at 2 PM and notified our sales team. They'll call to confirm details." },
    ],
  },
  {
    id: "recall",
    title: "Recall campaign callback",
    duration: "1:15",
    outcome: "Recall appointment booked",
    transcript: [
      { speaker: "DealerVoice", text: "Hi, this is DealerVoice calling on behalf of Valley GM about an open safety recall on your vehicle." },
      { speaker: "Customer", text: "Oh right, I've been meaning to handle that." },
      { speaker: "DealerVoice", text: "I can book you in tomorrow at 11 AM — the repair is complimentary and takes about 45 minutes." },
      { speaker: "Customer", text: "That works, thank you." },
    ],
  },
];

export const ROI_STORIES = [
  {
    dealer: "Metro Ford · 3 rooftops",
    metric: "238 appointments",
    period: "in 30 days",
    detail: "Recovered after-hours service calls that previously went to voicemail.",
    revenue: "$88,200",
    revenueLabel: "estimated revenue recovered",
  },
  {
    dealer: "Premier Toyota · Service dept",
    metric: "34% fewer",
    period: "missed calls",
    detail: "Replaced overnight call-center overflow with DealerVoice on nights and weekends.",
    revenue: "$21,400",
    revenueLabel: "monthly repair order lift",
  },
  {
    dealer: "Valley GM · BDC team",
    metric: "127 calls",
    period: "answered in month one",
    detail: "Qualified sales leads and booked test drives without adding headcount.",
    revenue: "14",
    revenueLabel: "extra vehicle sales attributed",
  },
];

export const INTEGRATIONS = [
  { name: "CDK Global", category: "DMS", status: "available" as const },
  { name: "Reynolds & Reynolds", category: "DMS", status: "available" as const },
  { name: "Dealertrack", category: "DMS", status: "coming" as const },
  { name: "VinSolutions", category: "CRM", status: "available" as const },
  { name: "Elead / CDK CRM", category: "CRM", status: "available" as const },
  { name: "Salesforce", category: "CRM", status: "coming" as const },
  { name: "Xtime", category: "Scheduling", status: "available" as const },
  { name: "Google Calendar", category: "Scheduling", status: "available" as const },
  { name: "Twilio", category: "Telephony", status: "available" as const },
  { name: "Razorpay", category: "Billing", status: "available" as const },
];

export const SOLUTIONS = {
  toyota: {
    slug: "toyota",
    brand: "Toyota",
    headline: "DealerVoice for Toyota Dealers",
    subheadline: "Answer every service and sales call 24/7. Book more appointments. Protect your CSI score.",
    pain: "Toyota dealers face high service volume and strict customer satisfaction targets. Missed calls hurt both revenue and CSI.",
    outcomes: ["Book service appointments automatically", "Route Prius/RAV4/Camry leads to BDC instantly", "Send SMS confirmations in customer's language"],
    cta: "Book a Toyota dealer demo",
  },
  ford: {
    slug: "ford",
    brand: "Ford",
    headline: "DealerVoice for Ford Dealers",
    subheadline: "Recover missed F-150 and Explorer service calls. Turn overflow into booked repair orders.",
    pain: "Ford trucks drive heavy service traffic. Peak-hour overflow means voicemails and lost ROs.",
    outcomes: ["Handle F-Series service scheduling at scale", "Qualify used-truck buyers 24/7", "Integrate with your Ford CRM workflows"],
    cta: "Book a Ford dealer demo",
  },
  gm: {
    slug: "gm",
    brand: "GM",
    headline: "DealerVoice for GM Dealers",
    subheadline: "Automate recall outreach, service booking, and sales qualification across Chevy, GMC, Buick, and Cadillac.",
    pain: "Recall campaigns spike call volume. Staff can't keep up — customers go to competitors.",
    outcomes: ["Outbound recall scheduling at scale", "Multi-brand routing for GM groups", "Reduce BDC overtime costs"],
    cta: "Book a GM dealer demo",
  },
  service: {
    slug: "service",
    brand: "Service Departments",
    headline: "DealerVoice for Service Departments",
    subheadline: "Fill your service bays. Answer every call. Book more repair orders without hiring.",
    pain: "Service advisors are on the floor. Phones ring unanswered. Every missed call is $250–$500 walking out the door.",
    outcomes: ["24/7 appointment booking", "Automated service reminders & confirmations", "Average RO lift of 15–20% in 90 days"],
    cta: "Book a service department demo",
  },
  bdc: {
    slug: "bdc",
    brand: "BDC Teams",
    headline: "DealerVoice for BDC Teams",
    subheadline: "Qualify leads, book appointments, and follow up — so your BDC focuses on closing, not answering.",
    pain: "BDC reps spend 60% of time on repetitive calls. Hot leads cool while they handle routine scheduling.",
    outcomes: ["AI handles tier-1 inbound calls", "Hot leads routed to reps in real time", "Cut cost-per-appointment by up to 40%"],
    cta: "Book a BDC demo",
  },
} as const;

export type SolutionSlug = keyof typeof SOLUTIONS;

export const SOLUTION_SLUGS = Object.keys(SOLUTIONS) as SolutionSlug[];
