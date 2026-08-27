"use client";

import { useEffect } from "react";
import { Star } from "lucide-react";

const SCRIPT_SRC = "https://widgets.sociablekit.com/google-reviews/widget.js";

interface GoogleReviewsBadgeProps {
  /** Compact card for right next to a form (default) vs a bare inline embed. */
  variant?: "card" | "bare";
  className?: string;
}

/**
 * SociableKit's Google Reviews widget (embed 25707203) — distinct from the
 * broader multi-source reviews widget already on the homepage
 * (components/testimonial.tsx, embed 25707200). Meant to sit directly next
 * to a form/CTA as a trust booster, not as a full reviews section.
 */
export default function GoogleReviewsBadge({ variant = "card", className = "" }: GoogleReviewsBadgeProps) {
  useEffect(() => {
    // Same dedupe pattern as components/testimonial.tsx — safe to mount
    // this component more than once on a page (e.g. contact form + booking
    // form) without loading the script twice.
    if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const widget = <div className="sk-ww-google-reviews" data-embed-id="25707203" />;

  if (variant === "bare") {
    return <div className={className}>{widget}</div>;
  }

  return (
    <div
      className={`rounded-2xl border border-[#1A14A5]/10 bg-white/80 backdrop-blur p-4 sm:p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#231F20]/60">
        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
        <span>Rated by real clients on Google</span>
      </div>
      {widget}
    </div>
  );
}
