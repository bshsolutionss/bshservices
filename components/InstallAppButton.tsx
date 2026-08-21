"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Not in lib.dom yet — Chromium-only event, but every browser tolerates listening for it. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "bsh_install_prompt_dismissed";

interface InstallAppButtonProps {
  /** "floating" — dismissible pill, bottom-right, for public pages (via SiteChrome).
   *  "inline" — plain nav-style button, for the admin sidebar footer next to Sign Out. */
  variant?: "floating" | "inline";
  className?: string;
}

/**
 * Captures the browser's `beforeinstallprompt` event so we can show our own
 * "Install App" affordance instead of relying on the browser's default
 * banner (which is inconsistent across browsers and easy to miss). Chrome/
 * Edge/Android only — iOS Safari and Firefox never fire this event, so the
 * button simply never appears there, which is the correct/expected fallback
 * (no custom "Add to Home Screen" walkthrough was asked for).
 */
export default function InstallAppButton({ variant = "floating", className }: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true); // starts hidden until localStorage is read, avoids a hydration flash
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    const onBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferredPrompt(null);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!deferredPrompt || dismissed) return null;

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      // The prompt can only be used once either way — drop it regardless of outcome.
      if (outcome === "accepted") setDeferredPrompt(null);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition disabled:opacity-50",
          className
        )}
      >
        <Download className="w-[18px] h-[18px] shrink-0" />
        {installing ? "Installing..." : "Install App"}
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-[#1A14A5]/10 pl-4 pr-2 py-2.5 max-w-[calc(100vw-2rem)]">
      <span className="text-sm font-medium text-[#231F20] whitespace-nowrap">Install BSH Solutions app</span>
      <button
        type="button"
        onClick={handleInstall}
        disabled={installing}
        className="bg-[#1A14A5] hover:bg-[#0e0a7a] text-white text-sm font-semibold px-3 py-1.5 rounded-xl disabled:opacity-50 shrink-0"
      >
        {installing ? "..." : "Install"}
      </button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss install prompt"
        className="p-1.5 text-[#231F20]/40 hover:text-[#231F20] shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
