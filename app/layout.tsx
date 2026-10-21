import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import SiteChrome from "@/components/SiteChrome";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import ClarityInit from "@/components/ClarityInit";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/GoogleTagManager";
import { safeJsonLd } from "@/lib/json-ld";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/site";
import { SERVICE_CATEGORIES } from "@/lib/services-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BSH Solutions | Web Development, AI & Digital Marketing",
    template: "%s | BSH Solutions",
  },
  description:
    "BSH Solutions (Business Smart Hub) builds fast websites, custom software and AI chatbots, and grows brands with SEO and digital marketing. Get a free quote.",
  keywords: [
    "BSH Solutions",
    "Business Smart Hub",
    "web development company",
    "software house",
    "AI automation agency",
    "AI chatbot development",
    "digital marketing agency",
    "SEO services",
    "UI/UX design agency",
    "mobile app development",
  ],
  applicationName: "BSH Solutions",
  category: "technology",
  creator: "BSH Solutions",
  publisher: "BSH Solutions",
  formatDetection: { telephone: false, email: false, address: false },
  authors: [{ name: "BSH Solutions", url: SITE_URL }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "BSH Solutions | Web Development, AI & Digital Marketing",
    description:
      "Websites, custom software, AI automation and digital marketing from BSH Solutions (Business Smart Hub). Smart, scalable solutions for growing businesses.",
    url: "./",
    siteName: "BSH Solutions",
    images: [
      {
        url: DEFAULT_OG_IMAGE.url,
        width: DEFAULT_OG_IMAGE.width,
        height: DEFAULT_OG_IMAGE.height,
        alt: DEFAULT_OG_IMAGE.alt,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BSH Solutions | Web Development, AI & Digital Marketing",
    description:
      "Websites, custom software, AI automation and digital marketing from BSH Solutions (Business Smart Hub). Smart, scalable solutions for growing businesses.",
    images: [DEFAULT_OG_IMAGE.url],
    // NOTE: this Twitter/X handle has an extra "s" ("BSHSolutionss") — not
    // touched here since it's a social-media identity, not a domain
    // reference; flagged separately, verify it's the account's actual @handle.
    creator: "@BSHSolutionss",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  // Served by app/manifest.ts at /manifest.webmanifest — not a static file.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BSH Solutions",
  },
  verification: {
    google: "mftol86q7hauVyXwfTJDkzh6lEIO_NfdlDqR24A6y_4",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A14A5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-white text-[#231F20]`}
      >
        {/* Google Tag Manager — script loads early, noscript fallback sits right after <body> */}
        <GoogleTagManager />
        <GoogleTagManagerNoScript />

        {/* Client-side smooth scroll only */}
        <SmoothScrollProvider>
          {/* Public Header/Footer — hidden on /admin, which renders its own shell */}
          <SiteChrome>{children}</SiteChrome>
        </SmoothScrollProvider>

        {/* Analytics */}
        <Analytics />
        <SpeedInsights />
        <ClarityInit />
        <GoogleAnalytics />

        {/* Site-wide entities used by page and article structured data. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "BSH Solutions",
              alternateName: ["Business Smart Hub", "BSH"],
              url: SITE_URL,
              description:
                "BSH Solutions (Business Smart Hub) is a technology partner offering web and software development, UI/UX and brand design, digital marketing, AI automation, and photography for growing businesses.",
              slogan: "A hub for all business tech needs",
              image: `${SITE_URL}${DEFAULT_OG_IMAGE.url}`,
              areaServed: "Worldwide",
              knowsAbout: [
                "Web development",
                "Custom software development",
                "Mobile app development",
                "eCommerce development",
                "UI/UX design",
                "Brand identity design",
                "Search engine optimization",
                "Digital marketing",
                "AI automation",
                "AI chatbots",
                "Answer engine optimization",
                "Photography and video production",
              ],
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: "BSH Solutions services",
                itemListElement: Object.values(SERVICE_CATEGORIES).map((category) => ({
                  "@type": "OfferCatalog",
                  name: category.name,
                  url: `${SITE_URL}${category.overviewPath}`,
                })),
              },
              logo: {
                "@type": "ImageObject",
                url: `${SITE_URL}/android-chrome-512x512.png`,
                width: 512,
                height: 512,
              },
              email: "info@bshsolutions.net",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  telephone: "+92 312 8994968",
                  contactType: "general inquiries",
                  email: "info@bshsolutions.net",
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+92 312 8994968",
                  contactType: "sales",
                  email: "sales@bshsolutions.net",
                },
                {
                  "@type": "ContactPoint",
                  telephone: "+92 312 8994968",
                  contactType: "customer support",
                  email: "support@bshsolutions.net",
                },
              ],
              // Social profile URLs — identities, not the site domain, so left
              // as-is; flagged separately (instagram/x below still carry the
              // old double-"s" handle while facebook/linkedin don't, worth
              // confirming which are the real accounts).
              sameAs: [
                "https://facebook.com/bshsolutions",
                "https://www.instagram.com/bshsolutionss",
                "https://www.linkedin.com/company/bshsolutions/",
                "https://x.com/BSHSolutionss",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "BSH Solutions",
              alternateName: "Business Smart Hub",
              description:
                "Web development, custom software, AI automation, design and digital marketing services from BSH Solutions.",
              publisher: { "@id": `${SITE_URL}/#organization` },
              inLanguage: "en",
            }),
          }}
        />
      </body>
    </html>
  );
}
