"use client";

import { FaWhatsapp } from "react-icons/fa";
import { buildWhatsAppUrl, DEFAULT_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  /** "floating" — persistent circular button, bottom-left, site-wide (via SiteChrome).
   *  "inline" — pill button to drop into a CTA row/section next to the form. */
  variant?: "floating" | "inline";
  message?: string;
  /** Where the click happened — goes into the analytics event so drop-off by placement is visible. */
  source: string;
  className?: string;
}

/**
 * Click-to-chat WhatsApp CTA. Opens wa.me with the message pre-filled so the
 * chat starts with real context instead of a blank box — see lib/whatsapp.ts.
 * Bottom-left specifically so it never collides with InstallAppButton's
 * bottom-right floating pill.
 */
export default function WhatsAppButton({
  variant = "inline",
  message = DEFAULT_WHATSAPP_MESSAGE,
  source,
  className,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(message);

  const handleClick = () => {
    trackEvent("whatsapp_click", { source });
  };

  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        aria-label="Chat with us on WhatsApp"
        className={cn(
          "fixed bottom-4 left-4 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:scale-105 active:scale-95 transition-transform",
          className
        )}
      >
        <FaWhatsapp className="w-7 h-7" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold px-5 py-3 shadow-md hover:shadow-lg transition-all",
        className
      )}
    >
      <FaWhatsapp className="w-5 h-5" />
      Chat on WhatsApp
    </a>
  );
}
