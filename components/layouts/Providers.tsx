"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { SiteTracker } from "@/components/analytics/SiteTracker";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";

const PostHogProvider = dynamic(() => import("./PostHogProvider"), { ssr: false });

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <PostHogProvider>
          <Suspense fallback={null}>
            <SiteTracker />
            <GoogleAnalytics />
          </Suspense>
          {children}
        </PostHogProvider>
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
