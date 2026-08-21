import type { MetadataRoute } from "next";

/**
 * Auto-served by Next.js at /manifest.webmanifest — no extra route config
 * needed. Replaces the old static public/site.webmanifest (removed) so
 * there's a single source of truth, reusing the same icon files already
 * referenced by app/layout.tsx's `metadata.icons` instead of a separate
 * /icons folder that doesn't exist in this project.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BSH Solutions",
    short_name: "BSH Solutions",
    description:
      "Business Smart Hub — scalable digital, software & IT solutions: web development, SEO and digital marketing.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1A14A5",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
