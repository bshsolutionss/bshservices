import Image from "next/image";
import Link from "next/link";
import React from "react";

interface HeroProps {
  title: string;
  subtitle: string;
  image: string;
}

/**
 * Server component (no animation library — the entrance is CSS only).
 * Reused across ~38 pages. `pt-28` clears the fixed site header, and the
 * height is `min-h` rather than a fixed vh so long titles never overflow
 * or collide with the header on short or narrow screens.
 */
export default function Hero({ title, subtitle, image }: HeroProps) {
  return (
    <section
      className="relative isolate flex min-h-[60vh] w-full items-center justify-center overflow-hidden bg-gray-900 px-4 pb-16 pt-28 sm:px-6 md:min-h-[65vh] md:pb-20 md:pt-32"
      aria-label={`${title} Hero Section`}
    >
      <Image
        src={image}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      {/* Single overlay keeps text readable on any image */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />

      <div className="mx-auto w-full max-w-4xl text-center">
        <h1 className="animate-in fade-in slide-in-from-bottom-4 text-balance text-3xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] duration-700 sm:text-4xl md:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-gray-200 duration-700 [animation-delay:150ms] [animation-fill-mode:backwards] sm:text-lg md:text-xl">
          {subtitle}
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-4 mt-8 flex justify-center duration-700 [animation-delay:300ms] [animation-fill-mode:backwards]">
          {/* This Hero is reused across ~38 pages that have no `#services`
              element of their own, so link to the real /Services page. */}
          <Link
            href="/Services"
            className="rounded-xl bg-[#1A14A5] px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#0e0a7a] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
}
