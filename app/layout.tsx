import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bshsolutionss.com"),
  title: {
    default: "BSH Solutions | Business Smart Hub",
    template: "%s | BSH Solutions",
  },
  description:
    "Business Smart Hub – A hub for all business tech needs. BSH Solutions provides top-notch digital, software, and IT solutions to empower businesses for the modern era.",
  keywords: [
    "BSH Solutions",
    "Business Smart Hub",
    "IT Company",
    "Software Development",
    "Digital Solutions",
    "Web Development",
    "Mobile App Development",
    "Tech Services",
  ],
  other: {
    "google-site-verification": "mftol86q7hauVyXwfTJDkzh6lEIO_NfdlDqR24A6y_4",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  authors: [{ name: "BSH Solutions", url: "https://bshsolutionss.com" }],
  openGraph: {
    title: "BSH Solutions | Business Smart Hub",
    description:
      "A hub for all business tech needs — innovative, scalable, and smart IT solutions for your business.",
    url: "https://bshsolutionss.com",
    siteName: "BSH Solutions",
    images: [
      {
        url: "https://bshsolutionss.com/android-chrome-512x512.png",
        width: 1200,
        height: 630,
        alt: "BSH Solutions - Business Smart Hub",
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
      { url: "/android-chrome-192x192.png", sizes: "192x192" },
      { url: "/android-chrome-512x512.png", sizes: "512x512" },
      { url: "/favicon-16x16.png", sizes: "16x16" },
      { url: "/favicon-32x32.png", sizes: "32x32" },
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/apple-touch-icon.png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",

  alternates: {
    canonical: "https://bshsolutionss.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />

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
