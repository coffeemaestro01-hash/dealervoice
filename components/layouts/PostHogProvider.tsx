"use client";

// PostHog is optional — only loads when NEXT_PUBLIC_POSTHOG_KEY is set
export default function PostHogProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
