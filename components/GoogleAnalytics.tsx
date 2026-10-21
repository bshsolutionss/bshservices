import Script from "next/script";

/**
 * Loads Google Analytics 4 (gtag.js) once, site-wide.
 * Renders nothing until NEXT_PUBLIC_GA_MEASUREMENT_ID is set — get the ID
 * (format "G-XXXXXXXXXX") from analytics.google.com → Admin → Data streams →
 * Web stream. Add it to Vercel's env vars (and .env.local for local dev).
 * Custom funnel events are sent through trackEvent() in lib/analytics.ts.
 */
export default function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) return null;

  return (
    <>
      {/* The heavy gtag.js download waits for the load event so it can't compete
          with first render; the tiny inline stub below still runs early and
          queues any events into dataLayer, which gtag.js replays on arrival. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="lazyOnload"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
}
