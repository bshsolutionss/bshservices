import Script from "next/script";

/**
 * Installs the Google Tag Manager container once, site-wide.
 * Renders nothing until NEXT_PUBLIC_GTM_ID is set (format "GTM-XXXXXXX",
 * from tagmanager.google.com → container → top bar). Pairs with
 * components/GoogleAnalytics.tsx: GTM and gtag share window.dataLayer, so
 * both work side by side. Don't also add a GA4 tag inside GTM, or every
 * pageview will be counted twice.
 */
export function GoogleTagManager() {
  const containerId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!containerId) return null;

  return (
    <Script id="google-tag-manager" strategy="afterInteractive">
      {`
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${containerId}');
      `}
    </Script>
  );
}

/**
 * The <noscript> fallback Google asks for directly after <body>.
 */
export function GoogleTagManagerNoScript() {
  const containerId = process.env.NEXT_PUBLIC_GTM_ID;
  if (!containerId) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
