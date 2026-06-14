import { GA_MEASUREMENT_ID } from "@/lib/analytics/google-analytics";

/** Exact Google-recommended gtag snippet for Tag Assistant / setup wizard detection. */
export function GoogleTagSnippet() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `,
        }}
      />
    </>
  );
}
