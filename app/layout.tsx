import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import Header from "@/components/header";
import Footer from "@/components/footer";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

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
  metadataBase: new URL("https://bshsolutionss.com"),
  title: {
    default: "BSH Solutions | Business Smart Hub",
    template: "%s | BSH Solutions",
  },
  description:
    "Business Smart Hub – A hub for all business tech needs. BSH Solutions provides scalable digital, software, and IT solutions for modern businesses.",
  keywords: [
    "BSH Solutions",
    "Business Smart Hub",
    "IT Company Pakistan",
    "Software Development",
    "Web Development",
    "Mobile App Development",
    "Digital Marketing",
    "Tech Services",
  ],
  authors: [{ name: "BSH Solutions", url: "https://bshsolutionss.com" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://bshsolutionss.com",
  },
  openGraph: {
    title: "BSH Solutions | Business Smart Hub",
    description:
      "Smart, scalable, and future-ready digital solutions for growing businesses.",
    url: "https://bshsolutionss.com",
    siteName: "BSH Solutions",
    images: [
      {
        url: "https://bshsolutionss.com/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "BSH Solutions – Business Smart Hub",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BSH Solutions | Business Smart Hub",
    description:
      "A hub for all business tech needs — powered by BSH Solutions.",
    images: ["https://bshsolutionss.com/android-chrome-512x512.png"],
    creator: "@bshsolutions",
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
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden bg-white text-[#231F20]`}
      >
        {/* Client-side smooth scroll only */}
        <SmoothScrollProvider>
          {/* Fixed header spacing handled here */}
          <Header />
          <main className="overflow-x-hidden">{children}</main>
          <Footer />
        </SmoothScrollProvider>

        {/* Analytics */}
        <Analytics />
        <SpeedInsights />

        {/* Structured Data – Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BSH Solutions",
              url: "https://bshsolutionss.com",
              logo: "https://bshsolutionss.com/android-chrome-512x512.png",
              sameAs: [
                "https://facebook.com/bshsolutions",
                "https://www.instagram.com/bshsolutionss",
                "https://www.linkedin.com/company/bshsolutions/",
                "https://twitter.com/bshsolutions",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
