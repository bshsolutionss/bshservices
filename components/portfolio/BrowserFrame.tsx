import React from "react";
import { Lock } from "lucide-react";

interface BrowserFrameProps {
  /** Host shown in the address bar, e.g. "silwalo.com". */
  host: string;
  children: React.ReactNode;
  className?: string;
  /** Smaller chrome for grid cards. */
  compact?: boolean;
}

/** A light browser window: traffic lights, address bar, then the content. */
export default function BrowserFrame({ host, children, className = "", compact = false }: BrowserFrameProps) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-[#1A14A5]/10 bg-white shadow-sm ${className}`}>
      <div className={`flex items-center gap-3 border-b border-[#1A14A5]/10 bg-[#F1F3FB] ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}>
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex min-w-0 max-w-[60%] flex-1 items-center justify-center gap-1.5 rounded-md bg-white px-3 py-1 text-[11px] font-medium text-[#231F20]/60 shadow-[inset_0_0_0_1px_rgba(26,20,165,0.08)]">
          <Lock className="h-3 w-3 shrink-0 text-[#1A14A5]/60" aria-hidden="true" />
          <span className="truncate">{host}</span>
        </div>
        <span className="w-10 shrink-0 sm:w-14" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
}
