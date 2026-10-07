import React from "react";

interface MonitorFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Screen shape; desktop monitors are 16:10. */
  screenClassName?: string;
}

/**
 * A computer-monitor mockup (bezel, screen, neck and base). The screen is a
 * fixed-aspect window — put scrollable content inside it.
 */
export default function MonitorFrame({ children, className = "", screenClassName = "aspect-[16/10]" }: MonitorFrameProps) {
  return (
    <div className={`mx-auto w-full ${className}`}>
      <div className="rounded-[1.25rem] bg-gradient-to-b from-[#2a2860] to-[#15133f] p-2.5 shadow-[0_30px_70px_-25px_rgba(26,20,165,0.55)] sm:rounded-[1.6rem] sm:p-3.5">
        <div className={`relative overflow-hidden rounded-lg bg-white sm:rounded-xl ${screenClassName}`}>{children}</div>
        <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 rounded-full bg-white/20 sm:mt-2.5" />
      </div>
      <div aria-hidden="true" className="mx-auto h-5 w-16 bg-gradient-to-b from-[#c9cdea] to-[#aeb3da] sm:h-7 sm:w-24" />
      <div aria-hidden="true" className="mx-auto h-1.5 w-32 rounded-full bg-gradient-to-b from-[#c9cdea] to-[#9aa0cf] sm:h-2 sm:w-48" />
    </div>
  );
}
